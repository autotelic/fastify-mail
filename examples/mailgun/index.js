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

  console.log(transporter)

  await fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter })

  fastify.get('/sendmail', async (req, reply) => {
    const templatePath = './templates'
    const context = { name: 'Test Name', sender: process.env.SENDER }

    const queued = await fastify.mail.sendMail({
      to: process.env.RECIPIENT,
      from: process.env.SENDER,
      subject: 'fastify-mail test'
    }, { templatePath, context })
    if (queued.error) {
      const { error } = queued
      reply.send(error)
    } else {
      const { messageId } = queued
      reply.send({ messageId })
    }
  })
}
