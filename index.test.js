const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('.')
const nunjucks = require('nunjucks')
const { relative, resolve } = require('path')
const sinon = require('sinon')

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
const testText = ''

const testMessage = {
  to: testRecipients,
  from: testSender,
  subject: testSubject,
  html: testHtml,
  replyTo: undefined,
  text: testText,
  cc: '',
  bcc: ''
}

test('mail, nodemailer & view decorators exist', async t => {
  t.teardown(async () => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()
  t.ok(fastify.hasDecorator('mail'))
  t.ok(fastify.hasDecorator('nodemailer'))
  t.ok(fastify.hasDecorator('view'))
})

test('view decorator does not exist if the engine is not provided', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { transporter: { jsonTransport: true } })
  t.notOk(fastify.hasDecorator('view'))
})

test('throws an error if point-of-view is not registered', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { transporter: { jsonTransport: true } })
  await t.rejects(fastify.ready(), Error('fastify-mail requires a view decorator.'))
  t.notOk(fastify.hasDecorator('view'))
})

test('throws an error if an invalid transporter is given', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: 'error' })
  await t.rejects(fastify.ready(), Error('Cannot create property \'mailer\' on string \'error\''))
})

test('fastify-mail uses templates to send mail when point-of-view is registered separately', async (t) => {
  t.teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = t.testdir({
    'html.njk': t.fixture('file', testHtml),
    'subject.njk': t.fixture('file', testSubject),
    'from.njk': t.fixture('file', testSender),
    'text.njk': t.fixture('file', testText)
  })

  const povConfig = {
    propertyName: 'foo',
    engine: { nunjucks },
    includeViewExtension: true,
    options: { filename: resolve('templates') }
  }

  const fastify = Fastify()
  fastify.register(require('point-of-view'), povConfig)
  fastify.after(() => {
    fastify.register(fastifyMail, { pov: { propertyName: 'foo' }, transporter: { jsonTransport: true } })
  })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testRecipients, relative(__dirname, testTemplates), testContext)

  t.ok(fastify.hasDecorator('foo'))
  t.same(sendMailStub.args[0], [testMessage])
  t.is(sendMailStub.args.length, 1)
})

test('fastify.mail.sendMail calls nodemailer.sendMail with correct arguments', async t => {
  t.teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = t.testdir({
    'html.njk': t.fixture('file', testHtml),
    'subject.njk': t.fixture('file', testSubject),
    'from.njk': t.fixture('file', testSender),
    'text.njk': t.fixture('file', testText)
  })

  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testRecipients, relative(__dirname, testTemplates), testContext)

  t.same(sendMailStub.args[0], [testMessage])
  t.is(sendMailStub.args.length, 1)
})

test('fastify.mail.sendMail returns an error with missing arguments', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()
  const { error } = await fastify.mail.sendMail()
  t.ok(error instanceof TypeError)
  t.is(error.message, 'The "path" argument must be of type string. Received undefined')
})
