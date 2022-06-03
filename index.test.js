const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('.')
const nunjucks = require('nunjucks')
const { relative, resolve } = require('path')
const sinon = require('sinon')

const testContext = { name: 'Test Name' }

const testHtmlTemplate =
  '<!DOCTYPE html>\n' +
  '<html lang="en">\n' +
  '  <head></head>\n' +
  '  <body>\n' +
  `    <p>Name: ${testContext.name}</p>\n` +
  '  </body>\n' +
  '</html>\n'

const testTextTemplate = `This is a test text message to ${testContext.name}`

const testHtml =
  '<!DOCTYPE html>\n' +
  '<html lang="en">\n' +
  '  <head></head>\n' +
  '  <body>\n' +
  '    <p>No template used. This is a text html email</p>\n' +
  '  </body>\n' +
  '</html>\n'

const testMessage = {
  to: 'to@ignoreme.com',
  from: 'from@ignoreme.com',
  replyTo: 'reply@ignoreme.com',
  subject: 'This is a plain text subject',
  html: testHtml,
  text: 'This is a plain text email message.',
  cc: 'cc@ignoreme.com',
  bcc: 'bcc@ignoreme.com'
}

const responseWhenTemplatesPresent = {
  to: 'to@ignoreme.com',
  from: 'from@ignoreme.com',
  replyTo: 'reply@ignoreme.com',
  subject: 'This is a plain text subject',
  html: testHtmlTemplate,
  text: 'This is a test text message to Test Name',
  cc: 'cc@ignoreme.com',
  bcc: 'bcc@ignoreme.com'
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
    'html.njk': t.fixture('file', testHtmlTemplate),
    'text.njk': t.fixture('file', testTextTemplate)
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

  await fastify.mail.sendMail(testMessage, { templatePath: relative(__dirname, testTemplates), context: testContext })

  t.ok(fastify.hasDecorator('foo'))
  t.same(sendMailStub.args[0], [responseWhenTemplatesPresent])
  t.is(sendMailStub.args.length, 1)
})

test('fastify-mail uses string variables (for text and html) when a template is not present', async (t) => {
  t.teardown(() => {
    fastify.close()
    sendMailStub.restore()
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

  await fastify.mail.sendMail(testMessage, { context: testContext })

  t.ok(fastify.hasDecorator('foo'))
  t.same(sendMailStub.args[0], [testMessage])
  t.is(sendMailStub.args.length, 1)
})

test('fastify-mail uses text template when available but defaults to provided html if no template is available', async (t) => {
  t.teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = t.testdir({
    'text.njk': t.fixture('file', testTextTemplate)
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

  await fastify.mail.sendMail(testMessage, { templatePath: relative(__dirname, testTemplates), context: testContext })

  t.ok(fastify.hasDecorator('foo'))
  t.same(sendMailStub.args[0][0].html, testHtml)
  t.is(sendMailStub.args.length, 1)
})

test('fastify.mail.sendMail calls nodemailer.sendMail with correct arguments', async t => {
  t.teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = t.testdir({
    'html.njk': t.fixture('file', testHtmlTemplate),
    'text.njk': t.fixture('file', testTextTemplate)
  })

  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testMessage, { templatePath: relative(__dirname, testTemplates), context: testContext })

  t.same(sendMailStub.args[0], [responseWhenTemplatesPresent])
  t.is(sendMailStub.args.length, 1)
})

test('fastify.mail.sendMail returns an error when required values are not present (from)', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()
  const { error } = await fastify.mail.sendMail({ to: 'to@ignoreme.com', subject: 'subject@ignoreme.com' })
  t.ok(error instanceof TypeError)
  t.is(error.message, '"from" must be defined')
})

test('fastify.mail.sendMail returns an error when no message is defined', async (t) => {
  t.teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()
  const { error } = await fastify.mail.sendMail()
  t.ok(error instanceof TypeError)
  t.is(error.message, 'message is not defined')
})
