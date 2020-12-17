'use strict'

const nodemailer = require('fastify-nodemailer')
const fastifyPlugin = require('fastify-plugin')

module.exports = fastifyPlugin(async function (fastify, options) {
  const { transporter } = options
  await fastify.register(nodemailer, transporter)

  const mail = {
    sendMail: (req, reply, content) => {
      fastify.nodemailer.sendMail(content, (err, info) => {
        if (err) {
          fastify.log.error(err)
        }
        reply.send({
          messageId: info.messageId
        })
      })
    }
  }
  fastify.decorate('mail', mail)
})
