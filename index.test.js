const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('.')
const pointOfView = require('point-of-view')
const nodemailer = require('fastify-nodemailer')
const ejs = require('ejs')
const { resolve } = require('path')
const sinon = require('sinon')

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

test('fastify.mail.sendMail calls nodemailer.sendMail with correct arguments', t => {
  const testContext = { name: 'test-context' }
  const testRecipients = ['test@example.com']
  const testTemplate = 'templates/index-with-includes'

  t.plan(5)
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

    fastify.nodemailer.sendMail = sinon.stub().returnsArg(0)
    const queued = await fastify.mail.sendMail(testRecipients, testTemplate, testContext)
    const { html, to } = queued
    t.error(sinon.assert.calledOnce(fastify.nodemailer.sendMail), 'nodemailer.sendMail is called')
    t.is(to, testRecipients)
    t.ok(html.includes(testContext.name), 'rendered html with context')
    t.ok(html.includes('<header>'), 'rendered html with includes')

    fastify.close()
  })
})
