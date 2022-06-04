'use strict'
const fastifyPlugin = require('fastify-plugin')
const pointOfView = require('point-of-view')
const { createTransport } = require('nodemailer')
const { resolve, join } = require('path')

const fastifyMail = async (fastify, opts) => {
  const { pov = {}, transporter } = opts

  //  point-of-view configurations:
  const { engine, propertyName = 'view' } = pov
  if (engine) {
    const config = {
      ...pov,
      includeViewExtension: true,
      options: { filename: resolve('templates') }
    }
    fastify.register(pointOfView, config)
  } else {
    fastify.addHook('onReady', async () => {
      if (!fastify.hasDecorator(propertyName)) {
        throw Error(`fastify-mail requires a ${propertyName} decorator.`)
      }
    })
  }

  // nodemailer configurations:
  fastify.decorate('nodemailer', createTransport(transporter))
  fastify.addHook('onClose', async () => {
    fastify.nodemailer.close()
  })

  // mail decorator configurations:
  const mail = {
    // the method that external users will call to send emails
    // it either sends the messsage straight to nodemailer or uses createMessage to render templates if opts.templatePath is a provided
    sendMail: async function (message, opts = {}) {
      try {
        const errors = this.validateMessage(message)
        if (errors.length) {
          throw new TypeError(errors.join('\n'))
        }
        const { templatePath, context } = opts
        const queued = templatePath
          ? fastify.nodemailer.sendMail(await this.createMessage(message, templatePath, context))
          : fastify.nodemailer.sendMail(message)
        return queued
      } catch (error) {
        return { error }
      }
    },
    // createMessage: async function (recipients, templates, context, opts = {}) {
    createMessage: async function (message, templatePath, context) {
      // renders a template with the given context based on the templateName which
      // should be found in the path provided by templates. Returns "" if the promise is rejected.
      const renderTemplate = async (templateName) => {
        return await fastify[propertyName](join(templatePath, templateName), context)
          .catch(() => { return null })
      }

      // if opts.templatePath is a string, render the template

      // if from or subject is provided in opts these will be used in preference to templates
      const from = message.from
      const to = message.to
      const subject = message.subject
      const replyTo = message.replyTo
      const cc = message.cc
      const bcc = message.bcc
      const html = message.html
      const text = message.text

      const [
        renderedHtml,
        renderedText
      ] = await Promise.all([
        await renderTemplate('html'),
        await renderTemplate('text')
      ])

      return {
        from,
        to,
        cc: cc,
        bcc: bcc,
        replyTo,
        subject: subject,
        html: renderedHtml || html,
        text: renderedText || text
      }
    },
    validateMessage: function (message) {
      let errors = []

      if (message) {
        if (!message.to) {
          errors.push('"to" must be defined')
        }

        if (!message.from) {
          errors.push('"from" must be defined')
        }

        if (!message.subject) {
          errors.push('"subject" must be defined')
        }
      } else {
        errors = ['message is not defined']
      }

      return errors
    }
  }
  fastify.decorate('mail', mail)
}

module.exports = fastifyPlugin(fastifyMail, {
  name: 'fastify-mail'
})
