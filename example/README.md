### To run the example app locally:

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