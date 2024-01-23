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
  '    <p>Name: {{ name }}</p>\n' +
  '  </body>\n' +
  '</html>\n'

const testTextTemplate = 'This is a test text message to {{ name }}'

const testHtml =
  '<!DOCTYPE html>\n' +
  '<html lang="en">\n' +
  '  <head></head>\n' +
  '  <body>\n' +
  '    <p>Name: Test Name</p>\n' +
  '  </body>\n' +
  '</html>\n'

const testMessage = {
  to: 'to@ignoreme.com',
  from: 'from@ignoreme.com',
  cc: 'cc@ignoreme.com',
  bcc: 'bcc@ignoreme.com',
  replyTo: 'reply@ignoreme.com',
  subject: 'This is a plain text subject',
  html: testHtml,
  text: 'This is a plain text email message.',
  attachments: [
    {
      filename: 'text1.txt',
      content: 'hello world!'
    }
  ]
}

const responseWhenTemplatesPresent = {
  to: 'to@ignoreme.com',
  from: 'from@ignoreme.com',
  cc: 'cc@ignoreme.com',
  bcc: 'bcc@ignoreme.com',
  replyTo: 'reply@ignoreme.com',
  subject: 'This is a plain text subject',
  html: testHtml,
  text: 'This is a test text message to Test Name',
  attachments: [
    {
      filename: 'text1.txt',
      content: 'hello world!'
    }
  ]
}

test('mail, nodemailer & view decorators exist', async ({ teardown, ok }) => {
  teardown(async () => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()

  ok(fastify.hasDecorator('mail'))
  ok(fastify.hasDecorator('nodemailer'))
  ok(fastify.hasDecorator('view'))
})

test('view decorator does not exist if the engine is not provided', async ({ teardown, notOk }) => {
  teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { transporter: { jsonTransport: true } })

  notOk(fastify.hasDecorator('view'))
})

test('throws an error if point-of-view is not registered', async ({ teardown, notOk, rejects }) => {
  teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { transporter: { jsonTransport: true } })
  await rejects(fastify.ready(), Error('fastify-mail requires a view decorator.'))

  notOk(fastify.hasDecorator('view'))
})

test('throws an error if an invalid transporter is given', async ({ teardown, rejects }) => {
  teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: 'error' })
  await rejects(fastify.ready(), Error('Cannot create property \'mailer\' on string \'error\''))
})

test('fastify-mail uses templates to send mail when point-of-view is registered separately', async ({ teardown, testdir, fixture, ok, same, equal }) => {
  teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = testdir({
    'html.njk': fixture('file', testHtmlTemplate),
    'text.njk': fixture('file', testTextTemplate)
  })

  const povConfig = {
    propertyName: 'foo',
    engine: { nunjucks },
    includeViewExtension: true,
    options: { filename: resolve('templates') }
  }

  const fastify = Fastify()
  fastify.register(require('@fastify/view'), povConfig)
  fastify.after(() => {
    fastify.register(fastifyMail, { pov: { propertyName: 'foo' }, transporter: { jsonTransport: true } })
  })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testMessage, { templatePath: relative(__dirname, testTemplates), context: testContext })

  ok(fastify.hasDecorator('foo'))
  same(sendMailStub.args[0], [responseWhenTemplatesPresent])
  equal(sendMailStub.args.length, 1)
})

test('fastify-mail uses string variables (for text and html) when a template is not present', async ({ teardown, ok, same, equal }) => {
  teardown(() => {
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
  fastify.register(require('@fastify/view'), povConfig)

  const loggedErrors = []
  fastify.log.error = (msg) => { loggedErrors.push(msg) }

  fastify.after(() => {
    fastify.register(fastifyMail, { pov: { propertyName: 'foo' }, transporter: { jsonTransport: true } })
  })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testMessage, { context: testContext })

  ok(fastify.hasDecorator('foo'))
  same(sendMailStub.args[0], [testMessage])
  equal(loggedErrors.length, 0)
  equal(sendMailStub.args.length, 1)
})

test('fastify-mail uses text template when available but defaults to provided html if no template is available', async ({ teardown, testdir, fixture, ok, same, equal }) => {
  teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = testdir({
    'text.njk': fixture('file', testTextTemplate)
  })

  const povConfig = {
    propertyName: 'foo',
    engine: { nunjucks },
    includeViewExtension: true,
    options: { filename: resolve('templates') }
  }

  const fastify = Fastify()
  fastify.register(require('@fastify/view'), povConfig)

  const loggedErrors = []
  fastify.log.error = (msg) => { loggedErrors.push(msg) }

  fastify.after(() => {
    fastify.register(fastifyMail, { pov: { propertyName: 'foo' }, transporter: { jsonTransport: true } })
  })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testMessage, { templatePath: relative(__dirname, testTemplates), context: testContext })

  ok(fastify.hasDecorator('foo'))
  same(sendMailStub.args[0][0].html, testHtml)
  equal(loggedErrors.length, 0)
  equal(sendMailStub.args.length, 1)
})

test('fastify-mail uses html template when available but defaults to provided text if no template is available', async ({ teardown, testdir, fixture, same, ok, equal }) => {
  teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = testdir({
    'html.njk': fixture('file', testHtmlTemplate)
  })

  const povConfig = {
    propertyName: 'foo',
    engine: { nunjucks },
    includeViewExtension: true,
    options: { filename: resolve('templates') }
  }

  const fastify = Fastify()
  fastify.register(require('@fastify/view'), povConfig)

  const loggedErrors = []
  fastify.log.error = (msg) => { loggedErrors.push(msg) }

  fastify.after(() => {
    fastify.register(fastifyMail, { pov: { propertyName: 'foo' }, transporter: { jsonTransport: true } })
  })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testMessage, { templatePath: relative(__dirname, testTemplates), context: testContext })

  ok(fastify.hasDecorator('foo'))
  same(sendMailStub.args[0][0].html, testHtml)
  same(sendMailStub.args[0][0].text, 'This is a plain text email message.')
  equal(loggedErrors.length, 0)
  equal(sendMailStub.args.length, 1)
})

test('fastify-mail will throw errors if templatePath is defined, but does not exist', async ({ teardown, testdir, equal }) => {
  teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = testdir({})

  const povConfig = {
    propertyName: 'foo',
    engine: { nunjucks },
    includeViewExtension: true,
    options: { filename: resolve('templates') }
  }

  const fastify = Fastify()
  fastify.register(require('@fastify/view'), povConfig)

  const loggedErrors = []
  fastify.log.error = (msg) => { loggedErrors.push(msg) }

  fastify.after(() => {
    fastify.register(fastifyMail, { pov: { propertyName: 'foo' }, transporter: { jsonTransport: true } })
  })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testMessage, { templatePath: relative(__dirname, testTemplates), context: testContext })

  equal(loggedErrors[0], 'fastify-mail: template not found: .tap/fixtures/.-index.test.js-fastify-mail-will-throw-errors-if-templatePath-is-defined-but-does-not-exist/html.njk')
  equal(loggedErrors[1], 'fastify-mail: template not found: .tap/fixtures/.-index.test.js-fastify-mail-will-throw-errors-if-templatePath-is-defined-but-does-not-exist/text.njk')
})

test('fastify.mail.sendMail calls nodemailer.sendMail with correct arguments', async ({ teardown, testdir, fixture, same, equal }) => {
  teardown(() => {
    fastify.close()
    sendMailStub.restore()
  })

  const testTemplates = testdir({
    'html.njk': fixture('file', testHtmlTemplate),
    'text.njk': fixture('file', testTextTemplate)
  })

  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()

  const sendMailStub = sinon.stub(fastify.nodemailer, 'sendMail')

  await fastify.mail.sendMail(testMessage, { templatePath: relative(__dirname, testTemplates), context: testContext })

  same(sendMailStub.args[0], [responseWhenTemplatesPresent])
  equal(sendMailStub.args.length, 1)
})

test('fastify.mail.sendMail returns an error when required values are not present (from)', async ({ teardown, ok, equal }) => {
  teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()
  const { error } = await fastify.mail.sendMail({ to: 'to@ignoreme.com', subject: 'subject@ignoreme.com' })

  ok(error instanceof TypeError)
  equal(error.message, '"from" must be defined')
})

test('fastify.mail.sendMail returns an error multiple required values are missing', async ({ teardown, ok, equal }) => {
  teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()
  const { error } = await fastify.mail.sendMail({ from: 'from@ignoreme.com' })

  ok(error instanceof TypeError)
  equal(error.message, '"to" must be defined\n"subject" must be defined')
})

test('fastify.mail.sendMail returns an error when no message is defined', async ({ teardown, ok, equal }) => {
  teardown(() => fastify.close())
  const fastify = Fastify()
  fastify.register(fastifyMail, { pov: { engine: { nunjucks } }, transporter: { jsonTransport: true } })
  await fastify.ready()
  const { error } = await fastify.mail.sendMail()

  ok(error instanceof TypeError)
  equal(error.message, 'message is not defined')
})
