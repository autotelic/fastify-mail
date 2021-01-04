'use strict'
const fastifyPlugin = require('fastify-plugin')

const fastifyMail = async (fastify) => {
  // TODO(matthew-charles-chan): When the 'point-of-view' plugin is updated with the plugin name and explicitly added to the dependencies array, remove the following if statement.
  if (!fastify.view) {
    throw new Error("The dependency 'point-of-view' of plugin 'fastify-mail' is not registered")
  }

  const mail = {
    createMessage: function (recipients, templates, context) {
      const htmlPromise = fastify.view(templates + '/html', context)
      const subjectPromise = fastify.view(templates + '/subject', context)
      const fromPromise = fastify.view(templates + '/from')

      return Promise.all([htmlPromise, subjectPromise, fromPromise])
        .then(([html, subject, from]) => {
          return {
            to: recipients,
            from,
            subject,
            html
          }
        })
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
  name: 'fastify-mail',
  // TODO(matthew-charles-chan): When the 'point-of-view' plugin is updated with the plugin name, we need to explicitly add it to the dependencies array here.
  dependencies: ['fastify-nodemailer']
})
