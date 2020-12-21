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
      api_key: 'mailgun-api-key',
      domain: 'mailgun-domain'
    }
  }
  const transporter = mg(mgOpts)

  const povOpts = {
    name: 'test',
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
    const queued = await fastify.mail.sendMail({ name: 'test' })
    queued.error ? reply.send(queued.error) : reply.send(queued)
  })
}
