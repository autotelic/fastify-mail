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

  const opts = {
    templatePath: "path/to/my/templates/",
    context: { name: "Test Name" }
  }

  const queued = await fastify.mail.sendMail(message, opts)

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
  - `html`: Contains the html template for the email.
  - `text`: Contains the text template for the email.

```
.
|--index.js
|--templates
    |-- html.njk
    |-- text.njk
```

#### Example Apps
See [/examples/mailgun](./examples/mailgun) for a working example app using [nodemailer-mailgun-transport](https://github.com/xr0master/mailgun-nodemailer-transport#readme).

See [/examples/maildev](./examples/maildev) for a working example app using [MailDev](https://maildev.github.io/maildev/)

### API

#### Decorator

This plugin decorates fastify with a `mail` object containing the following methods:

-  sendMail: 'function' - Calls `createMessage` to generate an message and uses [fastify-nodemailer](https://github.com/lependu/fastify-nodemailer) to send the generated email. 
  - Accepts the following arguments: 
    - message: 'object'
        - from: 'string' - The email address the email is to be sent from.
        - to: 'array' - Comma separated list or an array of recipients email addresses (`string`) that will appear on the To: field
        - cc: 'array' - Comma separated list or an array of recipients email addresses (`string`) that will appear on the Cc: field
        - bcc: 'array' - Comma separated list or an array of recipients email addresses (`string`) that will appear on the Bcc: field
        - replyTo : 'string' - An email address that will appear on the Reply-To: field
        - subject: 'string' - The subject of the email with context injected.
        - html: 'string' - The HTML version of the message as an Unicode string, with context injected.
        - text : 'string' - The plaintext version of the message as an Unicode string, with context injected
    - templatePath: 'string' - the relative path to the message's templates.
  - opts: 'object' - Object containing options:
      -  templatePath:  'string' - the relative path to the message's templates.
      -  context: 'object' - Object containing context for the message (such as - variables that will be used in copy)

  - Returns: 'object' with following properties:
    - accepted : 'array' of email addresses accepted - eg. [ 'test@example.com' ]
    - rejected : 'array' of email addresses rejected - eg. [],
    - envelopeTime
    - messageTime 
    - messageSize 
    - response 
    - envelope 
    - messageId

- createMessage: 'function' - Generates a message object where the data provided is updated to use templates where available with context variables injected
  - Accepts the following arguments: 
    - message: 'object'
      - fields as above
    - templatePath: 'string' - the relative path to the message's templates.
    - context: 'object' - Object containing context for the message (such as - variables that will be used in copy)

    For more details on this response see the Nodemail documentation [View nodemailer's docs here](https://nodemailer.com/smtp/)





### Testing

[Tap](https://node-tap.org/) is used for testing. To run tests:
```
$ npm test
```