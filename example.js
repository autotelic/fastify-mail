'use strict'

// const plugin = require('.')
const nodemailer = require('fastify-nodemailer')
const mg = require('nodemailer-mailgun-transport')

module.exports = async function (fastify, options) {
  const auth = {
    auth: {
      api_key: 'cd0d23a6f578d3b3e29334b1012f3a91-e5da0167-1a0a597e',
      domain: 'sandbox917b292a33b549b58267c341b082b4d7.mailgun.org'
    }
  }
  const transporter = mg(auth)
  // fastify.register(plugin, { customOption: 'new', overloaded: 'see-example.js' })
  await fastify.register(nodemailer, transporter)

  fastify.get('/sendmail', (req, reply) => {
    fastify.nodemailer.sendMail({
      from: 'sender@example.com',
      to: 'm.zj.chan@gmail.com',
      subject: 'foo',
      text: 'bar'
    }, (err, info) => {
      if (err) {
        console.log(err)
      }
      reply.send({
        messageId: info.messageId
      })
    })
  })
  fastify.post('/', (req, reply) => {
    reply.type('application/json')
    reply.send({ hello: 'world' })
  })
}
