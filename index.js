'use strict'
const fastifyPlugin = require('fastify-plugin')
const pointOfView = require('@fastify/view')
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
    // it either sends the message straight to nodemailer or uses createMessage to render templates if opts.templatePath is a provided
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
    // Creates the message object that will be sent to nodemailer.
    // It will either render the templates or use the data in the message object as is
    createMessage: async function (message, templatePath, context) {
      const formattedMessage = {
        to: message.to,
        cc: message.cc,
        bcc: message.bcc,
        from: message.from,
        subject: message.subject,
        replyTo: message.replyTo,
        html: message.html,
        text: message.text,
        attachments: message.attachments
      }

      if (templatePath) {
        const [
          { template: renderedHtml, error: htmlError },
          { template: renderedText, error: textError }
        ] = await Promise.all([
          await renderTemplate('html'),
          await renderTemplate('text')
        ])

        if (!renderedHtml && !renderedText) {
          fastify.log.error(`fastify-mail: ${htmlError}`)
          fastify.log.error(`fastify-mail: ${textError}`)
        }

        if (renderedHtml) {
          formattedMessage.html = renderedHtml
        }

        if (renderedText) {
          formattedMessage.text = renderedText
        }
      }

      return formattedMessage

      // renders a template with the given context based on the templateName & templatePath,
      // if it fails to render the template, it returns an error message instead.
      async function renderTemplate (templateName) {
        try {
          const template = await fastify[propertyName](join(templatePath, templateName), context)
          return { template }
        } catch (error) {
          return { error: error.message }
        }
      }
    },
    // validates the message object includes to, from, subject and returns an error message if it does not
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
