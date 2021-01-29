const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('.')
const nunjucks = require('nunjucks')
const { relative } = require('path')
const sinon = require('sinon')

const testTransporterObj = {
  jsonTransport: true
}

const testTransporterFn = (fastify, nodemailer) => {
  const transporter = {
    jsonTransport: true
  }
  fastify.register(nodemailer, transporter)
}

test('mail, nodemailer & view decorators exist', async t => {
  const fastify = Fastify()

  fastify.register(fastifyMail, { engine: { nunjucks }, testTransporterObj })

  await fastify.ready()
  t.ok(fastify.hasDecorator('mail'))
  t.ok(fastify.hasDecorator('nodemailer'))
  t.ok(fastify.hasDecorator('view'))
  fastify.close()
  t.end()
})

test('nodemailer registers with transporter default maildev', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks } })
  await fastify.ready()
  const transporter = fastify.nodemailer.transporter.name
  t.equal(transporter, 'SMTP')
  fastify.close()
  t.end()
})

test('nodemailer registers a transporter when passed a function', async t => {
  const fastify = Fastify()
  fastify.register(fastifyMail, { engine: { nunjucks }, testTransporterFn })
  await fastify.ready()
  t.ok(fastify.nodemailer)
  fastify.close()
})

test('register callback throws an error if the engine is missing', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(fastifyMail, { engine: null, testTransporterObj })

  fastify.ready(err => {
    t.ok(err instanceof Error)
    t.is(err.message, 'Missing engine')
    fastify.close()
  })
})

test('fastify.mail.createMessage exist', async t => {
  const fastify = Fastify()

  fastify.register(fastifyMail, { engine: { nunjucks }, testTransporterObj })

  await fastify.ready()
  t.ok(fastify.mail.createMessage)
  fastify.close()
})

test('fastify.mail.sendMail exist', async t => {
  const fastify = Fastify()

  fastify.register(fastifyMail, { engine: { nunjucks }, testTransporterObj })

  await fastify.ready()
  t.ok(fastify.mail.sendMail)
  fastify.close()
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

  fastify.register(fastifyMail, { engine: { nunjucks }, testTransporterObj })

  await fastify.ready()
  fastify.nodemailer.sendMail = sinon.stub()
  await fastify.mail.sendMail(testRecipients, relative(__dirname, testTemplates), testContext)
  t.error(sinon.assert.calledOnceWithExactly(fastify.nodemailer.sendMail, testMessage))
  fastify.close()
})

test('fastify.mail.sendMail returns an error with missing arguments', async t => {
  const fastify = Fastify()

  fastify.register(fastifyMail, { engine: { nunjucks }, testTransporterObj })

  await fastify.ready()
  await fastify.mail.sendMail()
    .then(res => {
      t.ok(res.error instanceof Error)
      t.is(res.error.message, 'The "path" argument must be of type string. Received undefined')
    })
  fastify.close()
})
