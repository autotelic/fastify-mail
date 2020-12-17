'use strict'

const mail = require('.')
const mg = require('nodemailer-mailgun-transport')

module.exports = async function (fastify, options) {
  const auth = {
    auth: {
      api_key: 'cd0d23a6f578d3b3e29334b1012f3a91-e5da0167-1a0a597e',
      domain: 'sandbox917b292a33b549b58267c341b082b4d7.mailgun.org'
    }
  }
  const transporter = mg(auth)

  await fastify.register(mail, {
    transporter
  })

  fastify.get('/sendmail', (req, reply) => {
    const content = {
      from: 'sender@example.com',
      to: 'm.zj.chan@gmail.com',
      subject: 'foo',
      text: 'test 3'
    }
    fastify.mail.sendMail(req, reply, content)
  })
}
