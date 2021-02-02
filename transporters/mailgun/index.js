const mg = require('nodemailer-mailgun-transport')

module.exports = (fastify, nodemailer) => {
  const mgConfig = {
    auth: {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }

  const transporter = mg(mgConfig)

  fastify.register(nodemailer, transporter)
}
