'use strict'
const nodemailer = require('fastify-nodemailer')
const fastifyPlugin = require('fastify-plugin')

module.exports = fastifyPlugin(async function (fastify, options) {
  const { transporter } = options
  await fastify.register(nodemailer, transporter)

  const mail = {
    sendMail: (rew, reply, context) => {
      fastify.nodemailer.sendMail(context, (err, info) => {
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
