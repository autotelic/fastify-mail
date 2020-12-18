'use strict'
const fastifyPlugin = require('fastify-plugin')

const fastifyMail = async (fastify) => {
  const mail = {
    sendMail: async (content) => {
      try {
        const queued = await fastify.nodemailer.sendMail(content)
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
