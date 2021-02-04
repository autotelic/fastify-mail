'use strict'
const fastifyPlugin = require('fastify-plugin')
const pointOfView = require('point-of-view')
const { createTransport } = require('nodemailer')
const { resolve, join } = require('path')

const fastifyMail = async (fastify, opts) => {
  const { pov = {}, transporter } = opts

  //  point-of-view configurations:
  const { engine, propertyName = 'view' } = pov
  if (engine) {
    const config = {
      ...pov,
      includeViewExtension: true,
      options: { filename: resolve('templates') }
    }
    fastify.register(pointOfView, config)
  } else {
    fastify.addHook('onReady', async () => {
      if (!fastify.hasDecorator(propertyName)) {
        throw Error(`fastify-mail requires a ${propertyName} decorator.`)
      }
    })
  }

  // nodemailer configurations:
  fastify.decorate('nodemailer', createTransport(transporter))
  fastify.addHook('onClose', async () => {
    fastify.nodemailer.close()
  })

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
