const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('.')
const pointOfView = require('point-of-view')
const nodemailer = require('fastify-nodemailer')
const ejs = require('ejs')
const { relative } = require('path')
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
  t.plan(2)
  const fastify = Fastify()

  const testContext = { name: 'Test Name' }

  const testRecipients = ['test@example.com']
  const testSender = 'sender@example.com'
  const testSubject = `${testContext.name}, Test Subject`
  const testHtml =
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '  <head></head>\n' +
    '  <body>\n' +
    '    <p>Name: test-context</p>\n' +
    '  </body>\n' +
    '</html>\n'

  const testMessage = {
    to: testRecipients,
    from: testSender,
    subject: testSubject,
    html: testHtml
  }

  const testTemplates = t.testdir({
    'html.ejs': t.fixture('file', testHtml),
    'subject.ejs': t.fixture('file', testSubject),
    'from.ejs': t.fixture('file', testSender)
  })

  fastify.register(nodemailer)
  fastify.register(pointOfView, {
    engine: {
      ejs
    },
    includeViewExtension: true,
    options: {
      filename: t.testdirName
    }
  })
  fastify.register(fastifyMail)

  fastify.ready(async err => {
    t.error(err)
    fastify.nodemailer.sendMail = sinon.stub()
    await fastify.mail.sendMail(testRecipients, relative('.', testTemplates), testContext)
    t.error(sinon.assert.calledOnceWithExactly(fastify.nodemailer.sendMail, testMessage))

    fastify.close()
  })
})
