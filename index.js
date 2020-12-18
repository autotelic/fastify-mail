'use strict'
const fastifyPlugin = require('fastify-plugin')
const pointOfView = require('point-of-view')
const ejs = require('ejs')
const resolve = require('path').resolve

const fastifyMail = async (fastify, options) => {
  const { templateOptions } = options
  const povOpts = templateOptions || {
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: 'templates',
    options: {
      filename: resolve('templates')
    }
  }
  fastify.register(pointOfView, povOpts)

  const createMessage = async (recipients, template, context) => {
    const html = await fastify.view(template, context)
    return {
      from: 'sender@example.com',
      to: recipients,
      subject: 'example',
      html
    }
  }
  const mail = {
    sendMail: async (recipients, templates, context) => {
      try {
        const queued = await fastify.nodemailer.sendMail(await createMessage(recipients, templates, context))
        const { messageId } = queued
        return { messageId }
      } catch (error) {
        return { error }
      }
    }
  }
  fastify.decorate('mail', mail)
}

module.exports = fastifyPlugin(fastifyMail, {
  name: 'fastify-mail',
  dependencies: ['fastify-nodemailer']
})
