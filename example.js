'use strict'

const mail = require('.')
const mg = require('nodemailer-mailgun-transport')
const nodemailer = require('fastify-nodemailer')

module.exports = async function (fastify, options) {
  const mgOpts = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAINGUN_DOMAIN
    }
  }
  const transporter = mg(mgOpts)
  fastify.register(nodemailer, transporter)
  fastify.register(mail)

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = [process.env.TEST_RECIPIENT]
    const queued = await fastify.mail.sendMail(recipients, 'test', { name: 'test' })
    queued.error ? reply.send(queued.error) : reply.send(queued)
  })
}
