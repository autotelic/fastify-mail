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
    const message = {
      to: ['test@example.com'],
      from: 'someone@example.com',
      subject: 'Test Subject'
    }

    const opts = {
      templatePath: './templates',
      context: { name: 'Test Name', sender: 'sender@example.com' }
    }

    const queued = await fastify.mail.sendMail(message, opts)

    if (queued.error) {
      const { error } = queued
      reply.send(error)
    } else {
      const { messageId } = queued
      reply.send({ messageId })
    }
  })

  fastify.get('/no-templates', async (req, reply) => {
    const testHtml =
      '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '  <head></head>\n' +
      '  <body>\n' +
      '    <p>HTML email - no templates were used</p>\n' +
      '  </body>\n' +
      '</html>\n'

    const message = {
      to: ['test@example.com'],
      from: 'someone@example.com',
      subject: 'Test Subject',
      html: testHtml,
      text: 'This is a plain text email message. No templates were used'
    }

    const queued = await fastify.mail.sendMail(message)

    if (queued.error) {
      const { error } = queued
      reply.send(error)
    } else {
      const { messageId } = queued
      reply.send({ messageId })
    }
  })
}
