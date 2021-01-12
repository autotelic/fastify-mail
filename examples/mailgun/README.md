### To run the example app locally:

- Install dependencies.

  ```sh
  npm i
  ```

- Update `examples/example-mailgun/index.js` with:
  - [mailgun](https://www.mailgun.com/) API key and domain
  - `recipients`
- Run the example.

  ```sh
  fastify start examples/mailgun/index.js -l info -w
  ```

- Send a GET request to `localhost:3000/sendmail.
