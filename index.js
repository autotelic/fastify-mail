'use strict'
const fastifyPlugin = require('fastify-plugin')

const fastifyMail = async (fastify) => {
  const createMessage = async (recipients, template, context) => {
    const html = await fastify.view(template, context)
    return {
      from: 'sender@example.com',
      to: recipients,
      subject: 'example',
      html
    }
  }
  const mail = {
    sendMail: async (recipients, template, context) => {
      try {
        const message = await createMessage(recipients, template, context)
        const queued = await fastify.nodemailer.sendMail(message)
        const { messageId } = queued
        return { messageId }
      } catch (error) {
        return { error }
      }
    }
  }
  fastify.decorate('mail', mail)
}

module.exports = fastifyPlugin(fastifyMail, {
  name: 'fastify-mail',
  dependencies: ['fastify-nodemailer']
})
