'use strict'
const fastifyPlugin = require('fastify-plugin')
const nodemailer = require('fastify-nodemailer')
const pointOfView = require('point-of-view')
const { resolve, join } = require('path')
const { maildev } = require('./transporters')

const fastifyMail = async (fastify, { engine, transporter = maildev }) => {
  // nodemailer transporter configurations:
  if (typeof transporter === 'function') {
    transporter(fastify, nodemailer)
  } else {
    fastify.register(nodemailer, transporter)
  }

  // point-of-view configurations:
  const povConfig = {
    engine,
    includeViewExtension: true,
    options: {
      filename: resolve('templates')
    }
  }
  fastify.register(pointOfView, povConfig)

  // decorator configurations:
  const mail = {
    createMessage: async function (recipients, templates, context) {
      const [
        html,
        subject,
        from
      ] = await Promise.all([
        fastify.view(join(templates, 'html'), context),
        fastify.view(join(templates, 'subject'), context),
        fastify.view(join(templates, 'from'), context)
      ])

      return {
        to: recipients,
        from,
        subject,
        html
      }
    },
    sendMail: async function (recipients, templates, context) {
      try {
        const message = await this.createMessage(recipients, templates, context)
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
