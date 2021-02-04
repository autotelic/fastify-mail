'use strict'
const fastifyMail = require('../../')
const nunjucks = require('nunjucks')

const transporter = {
  host: 'localhost',
  port: 1025,
  ignoreTLS: true
}

module.exports = async function (fastify, options) {
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter })

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = ['test@example.com']
    const templates = './templates'
    const context = { name: 'Test Name', sender: 'sender@example.com' }

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
