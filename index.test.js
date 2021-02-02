const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('.')
const nodemailer = require('fastify-nodemailer')
const nunjucks = require('nunjucks')
const { relative } = require('path')
const sinon = require('sinon')

test('mail, nodemailer & view decorators exist', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })
  await fastify.ready()
  t.ok(fastify.hasDecorator('mail'))
  t.ok(fastify.hasDecorator('nodemailer'))
  t.ok(fastify.hasDecorator('view'))
  fastify.close()
  t.end()
})

test('fastifyMail registers nodemailer with maildev as the default transporter', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks } })
  await fastify.ready()
  const { nodemailer: { transporter: SMTPTransport } } = fastify
  t.equal(SMTPTransport.name, 'SMTP')
  fastify.close()
  t.end()
})

test('nodemailer registers a transporter when passed a function', async t => {
  const spy = sinon.spy()
  const fastify = Fastify()
  await fastify.register(fastifyMail, { engine: { nunjucks }, transporter: spy })
  t.ok(spy.calledWith(fastify, nodemailer))
  t.end()
})

test('register callback throws an error if an invalid transporter is given', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: 'error' })

  fastify.ready(err => {
    t.ok(err instanceof Error)
    t.is(err.message, 'Cannot create property \'mailer\' on string \'error\'')
    fastify.close()
    t.end()
  })
})

test('register callback throws an error if the engine is missing', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(fastifyMail, { engine: null, transporter: { jsonTransport: true } })

  fastify.ready(err => {
    t.ok(err instanceof Error)
    t.is(err.message, 'Missing engine')
    fastify.close()
    t.end()
  })
})

test('fastify.mail.createMessage exist', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })
  await fastify.ready()
  t.ok(fastify.mail.createMessage)
  fastify.close()
  t.end()
})

test('fastify.mail.sendMail exist', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })
  await fastify.ready()
  t.ok(fastify.mail.sendMail)
  fastify.close()
  t.end()
})

test('fastify.mail.sendMail calls nodemailer.sendMail with correct arguments', async t => {
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
    'html.njk': t.fixture('file', testHtml),
    'subject.njk': t.fixture('file', testSubject),
    'from.njk': t.fixture('file', testSender)
  })

  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })

  await fastify.ready()
  fastify.nodemailer.sendMail = sinon.stub()
  await fastify.mail.sendMail(testRecipients, relative(__dirname, testTemplates), testContext)
  t.error(sinon.assert.calledOnceWithExactly(fastify.nodemailer.sendMail, testMessage))
  fastify.close()
  t.end()
})

test('fastify.mail.sendMail returns an error with missing arguments', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })
  await fastify.ready()
  await fastify.mail.sendMail()
    .then(res => {
      t.ok(res.error instanceof Error)
      t.is(res.error.message, 'The "path" argument must be of type string. Received undefined')
    })
  fastify.close()
  t.end()
})
