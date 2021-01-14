## Example Setup:

### Setup MailSlurper:
- Download and setup MailSlurper following the 'Get Started' instructions found [here](https://mailslurper.com/).
- Run the MailSlurper executable `./createcredentials` in the MailSlurper directory to create a username and password for the mail server.
- Start the MailSlurper server:
  ```sh
  ./mailslurper
  ```

### Setup Fastify-Mail:
- Install dependencies.

  ```sh
  cd examples/mailslurper
  npm i
  ```
- Update `examples/mailslurper/index.js` with:
  - `port`: the smtp port in the [MailSlurper `config.json` file](https://github.com/mailslurper/mailslurper/wiki/Getting-Started#step-2---configuration). Default is `2500`.
  - `user`: the username made in the createcredentials executable.
  - `pass`: the password created for that username in the createcredentials executable.
  - `recipients`.

## Running the Example:
- In the fastify-mail directory, run:
  ```sh
  npm start
  ```

- Send a GET request to `localhost:3000/sendmail`.
- Open your browser to `localhost:8080` or whichever `wwwPort` was set in `config.json` for MailSlurper
- You should see the test email appear in the MailSlurper interface!