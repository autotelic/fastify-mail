'use strict'

const mail = require('.')
const mg = require('nodemailer-mailgun-transport')

module.exports = async function (fastify, options) {
  const auth = {
    auth: {
      api_key: '<mailgun-api-key>',
      domain: '<mailgun-domain>'
    }
  }
  const transporter = mg(auth)

  await fastify.register(mail, {
    transporter
  })

  fastify.get('/sendmail', async (req, reply) => {
    const content = {
      from: 'sender@example.com',
      to: '<recipient>',
      subject: 'test',
      text: 'test fastify-nodemailer and nodemailer-mailgun-transport'
    }
    const message = await fastify.mail.sendMail(content)
    message.sent ? reply.send(message.messageId) : reply.send(message.error)
  })
}
