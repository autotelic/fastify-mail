'use strict'
const fastifyPlugin = require('fastify-plugin')
const { createTransport } = require('nodemailer')
const pointOfView = require('point-of-view')
const { resolve, join } = require('path')

const fastifyMail = async (fastify, opts) => {
  const { engine, transporter } = opts

  // nodemailer configurations:
  fastify.decorate('nodemailer', createTransport(transporter))
  fastify.addHook('onClose', async () => {
    fastify.nodemailer.close()
  })

  // point-of-view configurations:
  if (engine) {
    const povConfig = {
      engine,
      includeViewExtension: true,
      options: { filename: resolve('templates') }
    }
    fastify.register(pointOfView, povConfig)
  }

  // mail decorator configurations:
  const mail = {
    createMessage: async function (recipients, templates, context) {
      const [
        html,
        subject,
        from
      ] = await Promise.all([
        fastify.view(join(templates, 'html'), context),
        fastify.view(join(templates, 'subject'), context),
        fastify.view(join(templates, 'from'), context)
      ])

      return {
        to: recipients,
        from,
        subject,
        html
      }
    },
    sendMail: async function (recipients, templates, context) {
      try {
        const message = await this.createMessage(recipients, templates, context)
        const queued = await fastify.nodemailer.sendMail(message)
        return queued
      } catch (error) {
        return { error }
      }
    }
  }
  fastify.decorate('mail', mail)
}

module.exports = fastifyPlugin(fastifyMail, {
  name: 'fastify-mail'
})
