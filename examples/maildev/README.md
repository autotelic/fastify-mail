# Fastify-Mail Plugin with MailDev Example

### Setup:

- Fork and clone [fastify-mail repo](https://github.com/autotelic/fastify-mail).
- Install dependencies: `npm i`
- change directory to `examples/maildev` and install dependencies:

  ```sh
  cd examples/maildev
  npm i
  ```

- If you haven't already, install [direnv](https://direnv.net/docs/installation.html).
- Copy env example: `cp .envrc.example .envrc`
- _Optional:_ Update variables to preferred port and test email addresses.
- Unblock .envrc by running command `direnv allow`
- Run the example.

  ```sh
  npm start
  ```

- Open a browser to `localhost:1080` to view test inbox.
- Send a GET request to `localhost:3000/sendmail` and watch it appear at `localhost:1080`.

