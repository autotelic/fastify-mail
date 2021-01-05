## fastify-mail

A [Fastify](https://www.fastify.io/) plugin that uses [point-of-view](https://github.com/fastify/point-of-view#readme) and [fastify-nodemailer](https://github.com/lependu/fastify-nodemailer#readme)to template and send email messages.

### Usage

```sh
npm i @autotelic/fastify-mail
```

### Examples

```js
// index.js
const mail = require("@autotelic/fastify-mail");
const nodemailer = require("fastify-nodemailer");
const pointOfView = require("point-of-view");

// register peer dependencies fastify-nodemailer, point-of-view
const transporter = {
  // transporter options
};

const povOpts = {
  // point-of-view options
};

fastify.register(nodemailer, transporterOpts);
fastify.register(pointOfView, povOpts);

// register fastify-mail
fastify.register(mail);

// setup test route
fastify.get("/sendmail", async (req, reply) => {
  const recipients = ["test@example.com"];
  const templates = "templates/example";
  const context = { name: "Test Name" };

  const queued = await fastify.mail.sendMail(recipients, templates, context);
  if (queued.error) {
    const { error } = queued;
    reply.send(error);
  } else {
    const { messageId } = queued;
    reply.send({ messageId });
  }
});
```

See [/example](./example/index.js) for a working example app using [nodemailer-mailgun-transport](https://github.com/xr0master/mailgun-nodemailer-transport#readme).

To run the example app locally:

- install dependencies

  ```sh
  npm i
  ```

- update `example/index.js` with:
  - [mailgun](https://www.mailgun.com/) API key and domain
  - `recipients`
- run the example

  ```sh
  npm run example
  ```

- send a GET request to `localhost:3000/sendmail`

