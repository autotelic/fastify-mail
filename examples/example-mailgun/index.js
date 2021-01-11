'use strict'

const mail = require('../../')
const mg = require('nodemailer-mailgun-transport')
const nodemailer = require('fastify-nodemailer')
const pointOfView = require('point-of-view')
const ejs = require('ejs')
const { resolve } = require('path')

module.exports = async function (fastify, options) {
  const mgConfig = {
    auth: {
      api_key: '<mailgun-api-key>',
      domain: '<mailgun-domain>'
    }
  }

  const transporter = mg(mgConfig)

  const povConfig = {
    engine: {
      ejs
    },
    includeViewExtension: true,
    options: {
      filename: resolve('templates')
    }
  }

  fastify.register(nodemailer, transporter)
  fastify.register(pointOfView, povConfig)
  fastify.register(mail)

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = ['<recipient>']
    const templates = 'examples/example-mailgun/templates'
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
