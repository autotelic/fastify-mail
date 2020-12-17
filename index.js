'use strict'

const nodemailer = require('fastify-nodemailer')
const fastifyPlugin = require('fastify-plugin')

module.exports = fastifyPlugin(async function (fastify, options) {
  const { transporter } = options
  await fastify.register(nodemailer, transporter)

  const mail = {
    sendMail: async (content) => {
      try {
        const message = await fastify.nodemailer.sendMail(content)
        const { messageId } = message
        return {
          sent: true,
          messageId
        }
      } catch (error) {
        return {
          sent: false,
          error
        }
      }
    }
  }
  fastify.decorate('mail', mail)
})
