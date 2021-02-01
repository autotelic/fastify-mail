const MailDev = require('maildev')

module.exports = (fastify, nodemailer) => {
  const maildev = new MailDev({
    smtp: process.env.SMTP_PORT || 2500
  })

  const transporter = {
    host: 'localhost',
    port: process.env.SMTP_PORT || 2500,
    ignoreTLS: true
  }

  maildev.listen()
  fastify.register(nodemailer, transporter)
}
