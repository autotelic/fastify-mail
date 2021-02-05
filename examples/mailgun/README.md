# Fastify-Mail Plugin with mailgun Example

### Setup:

- Fork and clone [fastify-mail repo](https://github.com/autotelic/fastify-mail).
- Install dependencies: `npm i`
- change directory to `examples/mailgun` and install dependencies:

  ```sh
  cd examples/mailgun
  npm i
  ```

- Signup or login to [mailgun](https://www.mailgun.com/)
  - From the side navigation bar, click on `Sending` - you should see a `sandbox` testing domain.
  - Add your email to _Authorized Recipients_.
  - Click on `sandbox` domain and then click on `API`.
  - Make note of both your domain and API key.
- Copy env example: `cp .env.example .env`
- Update variables with information collected from mailgun.
- Run the example.

  ```sh
  npm start
  ```

- Send a GET request to `localhost:3000/sendmail`.
- Open the email inbox you listed as an authorized recipient to view test email.
