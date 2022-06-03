# Fastify-Mail Plugin with MailDev Example

### Setup:

- Fork and clone [fastify-mail repo](https://github.com/autotelic/fastify-mail).
- Install dependencies: `npm i`
- Change directory to `examples/maildev` and install dependencies:

  ```sh
  cd examples/maildev
  npm i
  ```

- Run a new docker container to get mailDev running:

  ```sh
  docker run -p 1080:80 -p 1025:25 --name maildev maildev/maildev
  ```

- Open a new terminal and run fastify-mail example:

  ```sh
  npm start
  ```

- Open a browser to `localhost:1080` to view test inbox.
- Send a GET request to `localhost:3000/sendmail` and watch it appear at `localhost:1080`.
- Send a GET request to `localhost:3000/sendmail?name=Kermit` for param appear in the email appear
- Send a GET request to `localhost:3000/no-templates` for a version where no templates are provided



