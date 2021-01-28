'use strict'

const fastifyMail = require('../../')
const ejs = require('ejs')

module.exports = async function (fastify, options) {
  fastify.register(fastifyMail, { engine: { ejs } })

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = ['test@example.com']
    const templates = '../templates'
    const context = { name: 'Test Name' }

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
