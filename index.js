'use strict'

const nodemailer = require('fastify-nodemailer')
const fastifyPlugin = require('fastify-plugin')

module.exports = fastifyPlugin(async function (fastify, options) {
  const { transporter } = options
  await fastify.register(nodemailer, transporter)

  const mail = {
    sendMail: (rew, reply, content) => {
      fastify.nodemailer.sendMail(content, (err, info) => {
        if (err) {
          console.log(err)
        }
        reply.send({
          messageId: info.messageId
        })
      })
    }
  }
  fastify.decorate('mail', mail)
})
