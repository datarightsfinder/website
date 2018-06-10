# ORG GDPR Tool Website

## Contents

* [What is this?](#what-is-this)
* [Contributing](#contribute)
* [Installation](#installation)
* [Configuring the webhook](#configuring-the-webhook)
* [Usage](#usage)

## What is this?

A tool and data repository to help people enforce their GDPR rights.

## Contributing

TODO

## Installation

### Local installation

Local installation has been tested on macOS High Sierra, with [Node.js](https://nodejs.org) 8.9.4, NPM 6.0.0 and PostgreSQL 10 installed using [postgres.app](https://postgresapp.com/).

1. Make sure a local PostgreSQL server is working and started and note it's DSN address. If you're using postgress.app and your macOS username is `foo`, the DSN will be:

  ```
  postgres://foo@localhost:5432/foo
  ```

2. In Terminal, clone this repository with `git clone git@github.com:projectsbyif/org-gdpr-tool-website.git`

3. Run `cd org-gdpr-tool-website`

4. Run `export NODE_ENV=development` and `export DATABASE_URL=<DSN>` where `<DSN>` is a Postgres DSN address like `postgres://ihutc_if@localhost:5432/ihutc_if`.

5. Run `npm install` to install dependencies

6. Run `gulp` to start the app

7. Go to `http://localhost:3000` in your browser

8. Then configure the webhook.

### Heroku installation

1. Make sure the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) is installed and you are logged in with `heroku login` in Terminal

2. Create a new Heroku app in the CLI or on heroku.com.

3. Add the Postgres add-on with the CLI (`heroku addons:create heroku-postgresql:hobby-dev`) or on heroku.com.

4. If necessary, add the Heroku remotes with `heroku git:remote -a <name of heroku app>`

5. Push the app with `git push heroku master`

6. Then configure the webbook.

## Usage

### Local usage

In Terminal, `cd` into the `org-gdpr-tool-website` folder, run `gulp`, then go to `http://localhost:3000` in your browser

### Heroku usage

The website is available at [https://org-gdpr-tool.herokuapp.com](https://org-gdpr-tool.herokuapp.com/).

## Configuring the webhook

The data for this app comes from the [projectsbyif/org-gdpr-tool-data](https://github.com/projectsbyif/org-gdpr-tool-data) repository on GitHub.

Whenever a push to master is made in this repository, GitHub will send information about what has changed to this app. It will then update the internal database to reflect the modifications in this GitHub repository.

### For local installations

1. Install [ngrok](https://ngrok.com/) and the app.

2. Run the app with `gulp`

3. Run ngrok with `./ngrok http 3000 -region eu`

4. Go to [https://github.com/projectsbyif/org-gdpr-tool-data/settings/hooks](https://github.com/projectsbyif/org-gdpr-tool-data/settings/hooks) and click "Add Webhook".

5. In "Payload URL", paste in the http forwarding address from ngrok, and add `/webhook/incoming`. For example, `http://abcd1234.eu.ngrok.io/webhook/incoming`

6. In "Content Type", choose `application/json`

7. In "Which events would you like to trigger this webhook?" choose "Just the `push` event"

8. Click "Add Webhook"

### For Heroku installations

1. Go to [https://github.com/projectsbyif/org-gdpr-tool-data/settings/hooks](https://github.com/projectsbyif/org-gdpr-tool-data/settings/hooks) and click "Add Webhook".

2. In "Payload URL", enter `https://org-gdpr-tool.herokuapp.com/webhook/incoming`

3. In "Content Type", choose `application/json`

4. In "Which events would you like to trigger this webhook?" choose "Just the `push` event"

5. Click "Add Webhook"
