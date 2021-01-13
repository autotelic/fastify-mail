### To run the example app locally:

- Install dependencies.

  ```sh
  cd examples/mailgun
  npm i
  ```

- Update `examples/example-mailgun/index.js` with:
  - [mailgun](https://www.mailgun.com/) API key and domain
  - `recipients`
- Run the example.

  ```sh
  npm start
  ```

- Send a GET request to `localhost:3000/sendmail.
