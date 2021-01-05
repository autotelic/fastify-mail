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

const transporterConfig = {
  // transporter config
}

fastify.register(nodemailer, transporterConfig)
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

#### Templates
Each message must have the following templates with the file extension set in point-of-view config:
  - `from`: Contains email address the email is to be sent from.
  - `subject`: Contains the subject for the email.
  - `html`: Contains the html for the email.
```
.
|--index.js
|--templates
   |-- email
      |-- html.ejs
      |-- subject.ejs
      |-- from.ejs
```

#### Example App
See [/example](./example) for a working example app using [nodemailer-mailgun-transport](https://github.com/xr0master/mailgun-nodemailer-transport#readme).

### API

#### Decorator

This plugin decorates fastify with a `mail` object containing the following methods:

- `createMessage`: `function` - Generates a message from templates with context injected. 
  - Accepts the following arguments: 
    - `recipients`: `array` - Array containing recipient[s] email address (`string`).
    - `templates`: `string` - the relative path to the message's templates.
    - `context`: `object` - Object containing context for the message.
  - Returns: `object` with following properties:
    - `to`: `array` - Array containing recipient[s] email address (`string`).
    - `from`: `string` - The email address the email is to be sent from.
    - `html`: `string` - The HTML of the email with context injected.
    - `subject`: `string` - The subject of the email with context injected.

- `sendMail`: `function` - Calls `createMessage` to generate an message and uses [fastify-nodemailer](https://github.com/lependu/fastify-nodemailer) to send the generated email. 
  - Accepts the following arguments: 
    - `recipients`: `array` - Array containing recipient[s] email address (`string`).
    - `templates`: `string` - The relative path to the message's templates.
    - `context`: `object` - Object containing context for the message.

### Testing

[Tap](https://node-tap.org/) is used for testing. To run tests:
```
$ npm test
```