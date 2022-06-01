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
    createMessage: async function (recipients, templates, context, opts = {}) {
      // renders a template with the given context based on the templateName which
      // should be found in the path provided by templates. Returns "" if the promise is rejected.
      const renderTemplate = async (templateName) => {
        return await fastify[propertyName](join(templates, templateName), context)
          .catch(() => { return '' })
      }

      // if from or subject is provided in opts these will be used in preference to templates
      const from = opts.from
      const subject = opts.subject
      const replyTo = opts.replyTo
      const cc = opts.cc
      const bcc = opts.bcc

      const [
        renderedFrom,
        renderedSubject,
        renderedHtml,
        renderedText
      ] = await Promise.all([
        await renderTemplate('from'),
        await renderTemplate('subject'),
        await renderTemplate('html'),
        await renderTemplate('text')
      ])

      return {
        from: from || renderedFrom,
        to: recipients,
        cc: cc || '',
        bcc: bcc || '',
        replyTo,
        subject: subject || renderedSubject,
        html: renderedHtml,
        text: renderedText || ''
      }
    },

    // the method that external users will call to send emails
    // it takes a recipients list or array, templates directory, a context, and an options object
    sendMail: async function (recipients, templates, context, opts = {}) {
      try {
        const message = await this.createMessage(recipients, templates, context, opts)
        const queued = await fastify.nodemailer.sendMail(message)
        return queued
      } catch (error) {
        return { error }
      }
    }
  }
  fastify.decorate('mail', mail)
}

module.exports = fastifyPlugin(fastifyMail, {
  name: 'fastify-mail'
})
