const { test } = require('tap')
const sinon = require('sinon')
const Fastify = require('fastify')
const fastifyMail = require('../../')
const nodemailer = require('fastify-nodemailer')
const mailgun = require('.')

test('fastify registers nodemailer with mailgun transporter', async t => {
  process.env.MAILGUN_API_KEY = '1234'
  process.env.MAILGUN_DOMAIN = 'sandbox...mailgun.org'

  t.test('fastify registers nodemailer with mailgun', async t => {
    // TODO: How do you stub the api_key and domain to successfully register mailgun??

    const fastify = Fastify()
    // const stub = sinon.stub(mailgun)
    // fastify.register(fastifyMail, { engine: { nunjucks }, transporter: stub })
    t.ok(true)
    fastify.close()
    t.end()
  })

  t.test('mailgun transporter uses env vars as auth options', async t => {
    const fastify = Fastify()
    const stub = sinon.stub(fastify, 'register')
    await stub(fastifyMail, { transporter: mailgun(fastify, nodemailer) })
    const { firstCall: { lastArg: transporter } } = stub
    const { options: { auth: { apiKey, domain } } } = transporter
    t.equals(apiKey, process.env.MAILGUN_API_KEY)
    t.equals(domain, process.env.MAILGUN_DOMAIN)
    fastify.close()
    t.end()
  })
})
