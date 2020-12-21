'use strict'
const fastifyPlugin = require('fastify-plugin')

const fastifyMail = async (fastify) => {
  // until 'point-of-view' plugin is updated with name, check if fastify.view namespace exists
  if (!fastify.view) {
    throw new Error('The dependency "point-of-view" of plugin "fastify-mail" is not registered')
  }

  const createMessage = async (context) => {
    const html = await fastify.view('templates/index', context)
    return {
      from: 'sender@example.com',
      to: ['<recipient>'],
      subject: 'example',
      html
    }
  }

  const mail = {
    sendMail: async (context) => {
      try {
        const message = await createMessage(context)
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
  // when 'point-of-view' plugin is updated with name, add to dependencies
  dependencies: ['fastify-nodemailer']
})
