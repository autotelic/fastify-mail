'use strict'
const fastifyMail = require('../..')
const mg = require('nodemailer-mailgun-transport')
const nunjucks = require('nunjucks')

module.exports = async function (fastify, options) {
  const mgConfig = {
    auth: {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }

  const transporter = mg(mgConfig)

  await fastify.register(fastifyMail, { engine: { nunjucks }, transporter })

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = [process.env.RECIPIENTS]
    const templates = './templates'
    const context = { name: 'Test Name', sender: process.env.SENDER }

    const queued = await fastify.mail.sendMail(recipients, templates, context)
    if (queued.error) {
      const { error } = queued
      reply.send(error)
    } else {
      const { messageId } = queued
      reply.send({ messageId })
    }
  })
}
