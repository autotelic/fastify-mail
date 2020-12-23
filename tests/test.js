const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('../')
const pointOfView = require('point-of-view')
const nodemailer = require('fastify-nodemailer')
const ejs = require('ejs')
const { resolve } = require('path')

const testContext = { name: 'test-context' }

test('fastify.mail exists', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(nodemailer)
  fastify.register(pointOfView, { engine: { ejs } })
  fastify.register(fastifyMail)

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.mail)

    fastify.close()
  })
})

test('fastify-mail throws error if plugin dependencies not registered:', t => {
  t.test('point-of-view', t => {
    t.plan(1)
    const fastify = Fastify()

    fastify.register(nodemailer)
    fastify.register(fastifyMail)

    fastify.ready(err => {
      t.ok(err instanceof Error)
    })
  })

  t.test('fastify-nodemailer', t => {
    t.plan(1)
    const fastify = Fastify()

    fastify.register(pointOfView, { engine: { ejs } })
    fastify.register(fastifyMail)

    fastify.ready(err => {
      t.ok(err instanceof Error)
    })
  })
  t.end()
})

test('fastify.mail.createMessage: ', t => {
  t.test('gets context dynamically', t => {
    t.plan(3)
    const fastify = Fastify()

    fastify.register(nodemailer)
    fastify.register(pointOfView, {
      engine: {
        ejs
      },
      includeViewExtension: true,
      options: {
        filename: resolve('templates')
      }
    })
    fastify.register(fastifyMail)

    fastify.ready(async err => {
      t.error(err)
      const queued = await fastify.mail.createMessage(testContext)

      t.ok(queued, 'message was created')
      const { html } = queued
      t.ok(html.includes(testContext.name), 'created html with context')

      fastify.close()
    })
  })

  t.test('renders html with includes', t => {
    t.plan(4)
    const fastify = Fastify()

    fastify.register(nodemailer)
    fastify.register(pointOfView, {
      engine: {
        ejs
      },
      includeViewExtension: true,
      options: {
        filename: resolve('templates')
      }
    })
    fastify.register(fastifyMail)

    fastify.ready(async err => {
      t.error(err)
      const queued = await fastify.mail.createMessage(testContext)

      t.ok(queued, 'message was created')
      const { html } = queued
      t.ok(html.includes('<header>'), 'created html includes header')
      t.ok(html.includes('<footer>'), 'created html includes footer')

      fastify.close()
    })
  })
  t.end()
})
