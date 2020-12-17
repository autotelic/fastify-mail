'use strict'

const nodemailer = require('fastify-nodemailer')
const fastifyPlugin = require('fastify-plugin')

module.exports = fastifyPlugin(async function (fastify, options) {
  const { transporter } = options
  await fastify.register(nodemailer, transporter)

  const mail = {
    sendMail: async (content) => {
      try {
        const queued = await fastify.nodemailer.sendMail(content)
        const { messageId } = queued
        return { messageId }
      } catch (error) {
        return { error }
      }
    }
  }
  fastify.decorate('mail', mail)
})
