const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('.')
const nunjucks = require('nunjucks')
const { relative } = require('path')
const sinon = require('sinon')

test('mail, nodemailer & view decorators exist', async t => {
  t.tearDown(async () => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })
  await fastify.ready()
  t.ok(fastify.hasDecorator('mail'))
  t.ok(fastify.hasDecorator('nodemailer'))
  t.ok(fastify.hasDecorator('view'))
})

test('register callback throws an error if an invalid transporter is given', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: 'error' })
  await t.rejects(fastify.ready(), Error('Cannot create property \'mailer\' on string \'error\''))
})

test('register callback throws an error if the engine is missing', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: null, transporter: { jsonTransport: true } })
  await t.rejects(fastify.ready(), Error('Missing engine'))
})

test('fastify.mail.createMessage exist', async t => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })
  await fastify.ready()
  t.ok(fastify.mail.createMessage)
})

test('fastify.mail.sendMail exist', async t => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })
  await fastify.ready()
  t.ok(fastify.mail.sendMail)
})

test('fastify.mail.sendMail calls nodemailer.sendMail with correct arguments', async t => {
  t.teardown(() => fastify.close())
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
})

test('fastify.mail.sendMail returns an error with missing arguments', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, transporter: { jsonTransport: true } })
  await fastify.ready()
  const { error } = await fastify.mail.sendMail()
  t.ok(error instanceof TypeError)
  t.is(error.message, 'The "path" argument must be of type string. Received undefined')
})
