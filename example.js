'use strict'

const mail = require('.')
const mg = require('nodemailer-mailgun-transport')
const nodemailer = require('fastify-nodemailer')

module.exports = async function (fastify, options) {
  const auth = {
    auth: {
      api_key: 'key-259f045b438f3b7661dfeada4b6ec578',
      domain: 'sandbox917b292a33b549b58267c341b082b4d7.mailgun.org'
    }
  }
  const transporter = mg(auth)
  fastify.register(nodemailer, transporter)
  fastify.register(mail)

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = ['recipient']
    const queued = await fastify.mail.sendMail(recipients, 'test', { name: 'test' })
    queued.error ? reply.send(queued.error) : reply.send(queued)
  })
}
