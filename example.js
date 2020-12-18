'use strict'

const mail = require('.')
const mg = require('nodemailer-mailgun-transport')
const nodemailer = require('fastify-nodemailer')
const pointOfView = require('point-of-view')
const ejs = require('ejs')
const resolve = require('path').resolve

module.exports = async function (fastify, options) {
  const mgOpts = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }
  const transporter = mg(mgOpts)

  const povOpts = {
    name: 'test',
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: 'templates',
    options: {
      filename: resolve('templates')
    }
  }

  fastify.register(nodemailer, transporter)
  fastify.register(pointOfView, povOpts)
  fastify.register(mail)

  fastify.get('/sendmail', async (req, reply) => {
    const recipients = [process.env.TEST_RECIPIENT]
    const queued = await fastify.mail.sendMail(recipients, 'index', { name: 'test' })
    queued.error ? reply.send(queued.error) : reply.send(queued)
  })
}
