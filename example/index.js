'use strict'

const mail = require('../')
const mg = require('nodemailer-mailgun-transport')
const nodemailer = require('fastify-nodemailer')
const pointOfView = require('point-of-view')
const ejs = require('ejs')
const { resolve } = require('path')

module.exports = async function (fastify, options) {
  const mgOpts = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }
  const transporter = mg(mgOpts)

  const povOpts = {
    engine: {
      ejs
    },
    includeViewExtension: true,
    options: {
      filename: resolve('templates')
    }
  }

  fastify.register(nodemailer, transporter)
  fastify.register(pointOfView, povOpts)
  fastify.register(mail)

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = ['<m.zj.chan@gmail.com>']
    const templates = 'example/templates'
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
