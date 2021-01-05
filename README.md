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

// register peer dependencies: fastify-nodemailer & point-of-view
const transporterOpts = {
  // transporter options
};

const povOpts = {
  // point-of-view options
};

fastify.register(nodemailer, transporterOpts)
fastify.register(pointOfView, povOpts)

// register fastify-mail
fastify.register(mail)

// setup test route
fastify.get("/sendmail", async (req, reply) => {
  const recipients = ["test@example.com"]
  const templates = "templates"
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
The above example assumes the following file structure.
```
.
|--index.js
|--templates
   |-- html.ejs
   |-- subject.ejs
   |-- from.ejs
```

See [/example](./example/index.js) for a working example app using [nodemailer-mailgun-transport](https://github.com/xr0master/mailgun-nodemailer-transport#readme).

To run the example app locally:

- Install dependencies.

  ```sh
  npm i
  ```

- Update `example/index.js` with:
  - [mailgun](https://www.mailgun.com/) API key and domain
  - `recipients`
- Run the example.

  ```sh
  npm run example
  ```

- Send a GET request to `localhost:3000/sendmail.

### Testing

[Tap](https://node-tap.org/) is used for testing. To run tests:
```
$ npm test
```
