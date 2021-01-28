'use strict'
const fastifyPlugin = require('fastify-plugin')
const { join } = require('path')
const nodemailer = require('fastify-nodemailer')
const { resolve } = require('path')
const { maildev, mailgun } = require('./transporters')
const { pointOfView } = require('point-of-view')

const fastifyMail = async (fastify, opts) => {
  // nodemailer transporter configurations:
  const transporterOption = opts.transporter
  const registerTransporter = function (transporter = maildev) {
    transporter(fastify, nodemailer)
  }
  if (transporterOption === 'mailgun') {
    registerTransporter(mailgun)
  } else if (typeof transporterOption === 'function') {
    registerTransporter(transporterOption)
  } else if (typeof transporterOption === 'object') {
    fastify.register(nodemailer, transporterOption)
  } else if (!transporterOption || transporterOption === 'maildev') {
    registerTransporter()
  }

  // point-of-view configurations:
  if (!opts.engine) {
    return await new Error('Missing engine object')
  }
  const engineType = opts.engine
  const povConfig = {
    engine: engineType,
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
