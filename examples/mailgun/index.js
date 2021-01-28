'use strict'

const mail = require('../..')
const pointOfView = require('point-of-view')
const ejs = require('ejs')
const { resolve } = require('path')

module.exports = async function (fastify, options) {
  const { registerTransporter, mailgun } = mail

  const povConfig = {
    engine: {
      ejs
    },
    includeViewExtension: true,
    options: {
      filename: resolve('templates')
    }
  }

  registerTransporter(mailgun)

  fastify.register(pointOfView, povConfig)
  fastify.register(mail)

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = [process.env.RECIPIENT]
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
