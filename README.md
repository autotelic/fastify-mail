## fastify-mail

A [Fastify](https://www.fastify.io/) plugin that uses [point-of-view](https://github.com/fastify/point-of-view#readme) and [fastify-nodemailer](https://github.com/lependu/fastify-nodemailer#readme) to template and send email messages.

### Usage

```sh
npm i @autotelic/fastify-mail
```

### Setup

`fastify-mail` decorates the reply interface with the `mail` method and takes two options to get started: `pov` and `transporter`

##### Point-of-View
- `pov.engine` should be a template engine object used to configure point-of-view
- to see a list of engines currently supported by point-of-view with options, [view docs here](https://github.com/fastify/point-of-view/blob/master/index.d.ts)
- For quick start, `fastify-mail` only requires the engine. For example, using `nunjucks`:

  ```js
  fastify.register(mail, { pov: { engine: { nunjucks: require('nunjucks') } }, transporter: ... })
  ```

- If you'd prefer to register `point-of-view` on your own, omit the `engine` option and `fastify-mail` will not register it.
- If you configure `point-of-view` with a different decorator name, add this to the options of `fastify-mail`
  ```js
  fastify.register(mail, { pov: { propertyName: 'POV_DECORATOR' }, transporter: ... })
  ```

##### Nodemailer
- `transporter` should be an object defining connection data to be used as a `nodemailer` SMTP transport. [View nodemailer's docs here](https://nodemailer.com/smtp/)
- `fastify-mail` decorates `fastify` with `nodemailer` so a transporter must be defined
- For example, using `maildev`:
  ```js
  const transporter = {
    host: 'localhost',
    port: 1025,
    ignoreTLS: true
  }

  fastify.register(mail, { pov: { engine: ... }, transporter })
  ```

### Example

```js
// index.js
const mail = require("@autotelic/fastify-mail")

// register fastify-mail
fastify.register(mail, pov: { {engine: { TEMPLATE_ENGINE_OBJECT } }, transporter: { NODEMAILER_TRANSPORTER_OBJECT } })

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
      |-- html.njk
      |-- subject.njk
      |-- from.njk
```

#### Example Apps
See [/examples/mailgun](./examples/mailgun) for a working example app using [nodemailer-mailgun-transport](https://github.com/xr0master/mailgun-nodemailer-transport#readme).

See [/examples/maildev](./examples/maildev) for a working example app using [MailDev](https://maildev.github.io/maildev/)

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