'use strict'
const fastifyPlugin = require('fastify-plugin')
const { join } = require('path')
const nodemailer = require('fastify-nodemailer')
const { maildev } = require('./transporters')

const fastifyMail = async (fastify) => {
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
    },
    registerTransporter: function ({ transporter = maildev }) {
      transporter(fastify, nodemailer)
    }
  }
  mail.registerTransporter(fastify, nodemailer)
  fastify.decorate('mail', mail)
}

module.exports = fastifyPlugin(fastifyMail, {
  name: 'fastify-mail',
  dependencies: ['point-of-view']
})
