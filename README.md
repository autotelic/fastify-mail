## fastify-mail

A [Fastify](https://www.fastify.io/) plugin that uses [point-of-view](https://github.com/fastify/point-of-view#readme) and [fastify-nodemailer](https://github.com/lependu/fastify-nodemailer#readme) to template and send email messages.

### Usage

```sh
npm i @autotelic/fastify-mail
```

### Example

```js
// index.js
const mail = require("@autotelic/fastify-mail")
const nodemailer = require("fastify-nodemailer")
const pointOfView = require("point-of-view")

// register plugin dependencies: fastify-nodemailer & point-of-view

// point-of-view config must include a template engine and includeViewExtension: true
const povConfig = {
  engine: {
    // template engine
  },
  includeViewExtension: true
}

fastify.register(nodemailer, transporter)
fastify.register(pointOfView, povConfig)

// register fastify-mail
fastify.register(mail)

// setup test route
fastify.get("/sendmail", async (req, reply) => {
  const recipients = ["test@example.com"]
  const templates = "path/to/my/templates/"
  const context = { name: "Test Name" }

  const queued = await fastify.mail.sendMail(recipients, templates, context)
  if (queued.error) {
    const { error } = queued
    reply.send(error);
  } else {
    const { messageId } = queued
    reply.send({ messageId })
  }
})
```
The above example assumes the following file structure. Each template must have the file extension of the template engine set in point-of-view config.
```
.
|--index.js
|--templates
   |-- html.ejs
   |-- subject.ejs
   |-- from.ejs
```

See [/example](./example) for a working example app using [nodemailer-mailgun-transport](https://github.com/xr0master/mailgun-nodemailer-transport#readme).
