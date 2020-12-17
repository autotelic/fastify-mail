'use strict'

const mail = require('.')
const mg = require('nodemailer-mailgun-transport')
const nodemailer = require('fastify-nodemailer')

module.exports = async function (fastify, options) {
  const auth = {
    auth: {
      api_key: '<mailgun-api-key>',
      domain: '<mailgun-domain>'
    }
  }
  const transporter = mg(auth)
  fastify.register(nodemailer, transporter)
  fastify.register(mail)

  fastify.get('/sendmail', async (req, reply) => {
    const content = {
      from: 'sender@example.com',
      to: '<recipient>',
      subject: 'test',
      text: 'test fastify-nodemailer and nodemailer-mailgun-transport'
    }
    const queued = await fastify.mail.sendMail(content)
    queued.error ? reply.send(queued.error) : reply.send(queued)
  })
}
