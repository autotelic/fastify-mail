# Fastify-Mail Plugin with MailDev Example

### Setup:

- Fork and clone [fastify-mail repo](https://github.com/autotelic/fastify-mail).
- Install dependencies: `npm i`
- change directory to `examples/maildev` and install dependencies:

  ```sh
  cd examples/maildev
  npm i
  ```
- _Optional:_ If you'd like to set a custom smtp port, create `.env` containing `SMTP_PORT=<prefrred port>`
- Run the example.

  ```sh
  npm start
  ```

- Open a browser to `localhost:1080` to view test inbox.
- Send a GET request to `localhost:3000/sendmail` and watch it appear at `localhost:1080`.

