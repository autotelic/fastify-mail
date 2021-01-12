### Example Setup:

- Install dependencies.

  ```sh
  npm i
  ```
- Download and setup MailSlurper following the 'Get Started' instructions found [here](https://mailslurper.com/).
- Run the MailSlurper executable `./createcredentials` in the MailSlurper directory to create a username and password for the mail server.
- Update `examples/example-mailslurper/index.js` with:
  - `port`: the smtp port in the MailSlurper config file. Default is `2500`
  - `username`: the username made in the createcredentials executable.
  - `password`: the password created for that username in the createcredentials executable.
  - `recipients`

### Running the Example:
- In the MailSlurper director, run:
  ```sh
  ./mailslurper
  ```
- In the directory containing fastify-mail, run:
  ```sh
  npm run example-ms
  ```

- Send a GET request to `localhost:3000/sendmail`.
- Open your browser to `localhost:8080` or whichever `wwwPort` was set in `config.json` for MailSlurper
- You should see the test email appear!
