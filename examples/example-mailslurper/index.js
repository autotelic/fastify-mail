'use strict'

const mail = require('../..')
const nodemailer = require('fastify-nodemailer')
const pointOfView = require('point-of-view')
const ejs = require('ejs')
const { resolve } = require('path')

module.exports = async function (fastify, options) {
  const mailSlurpConfig = {
    host: 'localhost',
    port: 2500, // smtp port in MailSlurper config.json
    auth: {
      user: 'username', // from MailSlurper credentials setup
      pass: 'password' // from MailSlurper credentials setup
    }
  }

  const povConfig = {
    engine: {
      ejs
    },
    includeViewExtension: true,
    options: {
      filename: resolve('templates')
    }
  }

  fastify.register(nodemailer, mailSlurpConfig)
  fastify.register(pointOfView, povConfig)
  fastify.register(mail)

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = ['<recipient>']
    const templates = 'examples/example-mailslurper/templates'
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
