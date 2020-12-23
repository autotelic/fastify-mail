const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('.')
const pointOfView = require('point-of-view')
const nodemailer = require('fastify-nodemailer')
const ejs = require('ejs')
const { resolve } = require('path')
const sinon = require('sinon')

const testContext = { name: 'test-context' }

test('mail decorator exists', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(nodemailer)
  fastify.register(pointOfView, { engine: { ejs } })
  fastify.register(fastifyMail)

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.hasDecorator('mail'))

    fastify.close()
  })
})

test('fastify-mail throws error if plugin dependencies not registered:', t => {
  t.test('point-of-view', t => {
    t.plan(2)
    const fastify = Fastify()

    fastify.register(nodemailer)
    fastify.register(fastifyMail)

    fastify.ready(err => {
      t.ok(err instanceof Error)
      t.is(err.message, "The dependency 'point-of-view' of plugin 'fastify-mail' is not registered")
    })
  })

  t.test('fastify-nodemailer', t => {
    t.plan(2)
    const fastify = Fastify()

    fastify.register(pointOfView, { engine: { ejs } })
    fastify.register(fastifyMail)

    fastify.ready(err => {
      t.ok(err instanceof Error)
      t.is(err.message, "The dependency 'fastify-nodemailer' of plugin 'fastify-mail' is not registered")
    })
  })
  t.end()
})

test('fastify.mail.sendMail', t => {
  t.test('calls createMessage', t => {
    t.plan(2)
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

      fastify.mail.createMessage = sinon.spy()
      await fastify.mail.sendMail(testContext)
      t.error(sinon.assert.calledOnce(fastify.mail.createMessage))

      fastify.close()
    })
  })
  t.test('calls nodemailer.sendMail', t => {
    t.plan(2)
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

      fastify.nodemailer.sendMail = sinon.spy()
      await fastify.mail.sendMail(testContext)
      t.error(sinon.assert.calledOnce(fastify.nodemailer.sendMail))

      fastify.close()
    })
  })
  t.end()
})

test('fastify.mail.createMessage', t => {
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
