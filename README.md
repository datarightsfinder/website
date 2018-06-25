# Data Rights Finder Website

This is the codebase for [Data Rights Finder](https://www.datarightsfinder.org) by IF and Open Rights Group.

Code is licenced under the MIT Licence. Please use the [Google JavaScript style guide](https://google.github.io/styleguide/jsguide.html) when contributing.

## Contents

* [Installation](#installation)
* [Configuring the webhook](#configuring-the-webhook)
* [App configuration](#app-configuration)
* [Scripts](#scripts)

## Installation

### Local installation

Local installation has been tested on macOS High Sierra, with [Node.js](https://nodejs.org) 8.9.4, npm 6.0.0 and PostgreSQL 10 installed using [postgres.app](https://postgresapp.com/).

1. Make sure a local PostgreSQL server running and you know its DSN. If you're using postgress.app and your macOS username is `foo`, the DSN will be:

  ```
  postgres://foo@localhost:5432/foo
  ```

2. In Terminal, clone this repository with `git clone git@github.com:datarightsfinder/website.git`

3. Run `cd open-data-rights-website`

4. Run `export DATABASE_URL=<DSN>` where `<DSN>` is your PostgreSQL DSN.

5. Run `npm install` to install dependencies

6. Run `gulp` to start the app. (If this fails, run `sudo npm install -g gulp-cli` and try again).

7. Go to `http://localhost:3000` in your browser

8. If you need to test the GitHub sync webhook, read [Configuring the webhook](#configuring-the-webhook).

### Heroku installation

1. Set up the GitHub sync webhook by reading [Configuring the webhook](#configuring-the-webhook).

2. Make sure the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) is installed and you are logged in with `heroku login` in Terminal

3. Create a new Heroku app in the CLI or on heroku.com.

4. Add the Postgres add-on with the CLI (`heroku addons:create heroku-postgresql:hobby-dev`) or on heroku.com.

5. If necessary, add the Heroku remotes with `heroku git:remote -a <name of heroku app>`

6. Push the app with `git push heroku master`

## Configuring the webhook

The data for this app comes from the [datarightsfinder/data](https://github.com/datarightsfinder/data) repository on GitHub.

Whenever a push to master is made in this repository, GitHub will send information about what has changed to this app. It will then update the internal database to reflect the modifications in this GitHub repository.

### For local installations

1. Install [ngrok](https://ngrok.com/).

2. Follow the instructions to install the app locally.

3. Run the app with `gulp`

4. Run ngrok with `./ngrok http 3000 -region eu`

5. Go to [https://github.com/datarightsfinder/data/settings/hooks](https://github.com/datarightsfinder/data/settings/hooks) and click "Add Webhook".

6. In "Payload URL", paste in the http forwarding address from ngrok, and add `/webhook/incoming` to the end. For example, `http://abcd1234.eu.ngrok.io/webhook/incoming`

7. In "Content Type", choose `application/json`

8. In "Which events would you like to trigger this webhook?" choose "Just the `push` event"

9. Click "Add Webhook"

### For Heroku installations

1. Go to [https://github.com/datarightsfinder/data/settings/hooks](https://github.com/datarightsfinder/data/settings/hooks) and click "Add Webhook".

2. In "Payload URL", enter `https://www.datarightsfinder.org/webhook/incoming`

3. In "Content Type", choose `application/json`

4. In "Which events would you like to trigger this webhook?" choose "Just the `push` event"

5. Click "Add Webhook"

## App configuration

* `/settings.yaml` This file contains the main settings for the app, including its name, URL and references to email addresses and GitHub repositories

* `/config/message_templates.js` This file contains the templates used when clicking email links for exercising rights

## Scripts

* `npm run seed` This command is automatically run when installing this project for the first time. If you need to reset the data in your local database with data from GitHub, run this command.
