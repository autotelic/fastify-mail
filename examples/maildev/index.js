'use strict'

const fastifyMail = require('../../')
const ejs = require('ejs')

module.exports = async function (fastify, options) {
  fastify.register(fastifyMail, { engine: { ejs } })

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = [process.env.RECIPIENTS]
    const templates = '../templates'
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
