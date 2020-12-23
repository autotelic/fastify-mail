const { test } = require('tap')
const Fastify = require('fastify')
const fastifyMail = require('../')
const pointOfView = require('point-of-view')
const nodemailer = require('fastify-nodemailer')
const ejs = require('ejs')

test('fastify.mail exists', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(nodemailer)
  fastify.register(pointOfView, { engine: { ejs } })
  fastify.register(fastifyMail)

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.mail)

    fastify.close()
  })
})

test('fastify-mail throws error if plugin dependencies not registered:', t => {
  t.test('point-of-view', t => {
    t.plan(1)
    const fastify = Fastify()

    fastify.register(nodemailer)
    fastify.register(fastifyMail)

    fastify.ready(err => {
      t.ok(err instanceof Error)
    })
  })

  t.test('fastify-nodemailer', t => {
    t.plan(1)
    const fastify = Fastify()

    fastify.register(pointOfView, { engine: { ejs } })
    fastify.register(fastifyMail)

    fastify.ready(err => {
      t.ok(err instanceof Error)
    })
  })
  t.end()
})
