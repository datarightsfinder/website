# Data Rights Finder Website

This is the codebase for [Data Rights Finder](https://www.datarightsfinder.org) by IF and Open Rights Group.

Code is licenced under the MIT Licence. Please use the [Google JavaScript style guide](https://google.github.io/styleguide/jsguide.html) when contributing.

## Contents

* [Installation](#installation)
* [Configuring the webhook](#configuring-the-webhook)
* [App configuration](#app-configuration)
* [Updates to privacy notices](#updates-to-privacy-notices)
* [Scripts](#scripts)

## Installation

### Local installation

Local installation has been tested on macOS High Sierra, with [Node.js](https://nodejs.org) 8.9.4, npm 6.0.0 and PostgreSQL 10 installed using [postgres.app](https://postgresapp.com/).

1. Make sure a local PostgreSQL server running and you've created a database called `datarightsfinder`. If you're using postgress.app and your macOS username is `foo`, the DSN will be:

  ```
  postgres://foo@localhost:5432/datarightsfinder
  ```

2. In Terminal, clone this repository with `git clone git@github.com:datarightsfinder/website.git`

3. Run `cd website`

4. Create a new file called `.env` and paste in the following template:

  ```
  DATABASE_URL=CHANGEME
  GITHUB_TOKEN=CHANGEME
  WEBHOOK_KEY=foobar
  ```

  * Replace the value for `DATABASE_URL` with your PostgreSQL DSN.
  * Replace the value for `GITHUB_TOKEN` with a [personal access token from GitHub](https://github.com/settings/tokens). This token should have the `public_repo` scope only.
  * `WEBHOOK_KEY` can have a dummy value, unless you need to [configure the webhook](#configuring-the-webhook).


5. Run `npm install` to install dependencies

6. Run `node seed.js` to populate the empty database

7. Run `gulp` to start the app. (If this fails, run `sudo npm install -g gulp-cli` and try again).

8. Go to `http://localhost:3000` in your browser

9. If you need to test the GitHub sync webhook, read [Configuring the webhook](#configuring-the-webhook).

### Heroku installation

1. Set up the GitHub sync webhook by reading [Configuring the webhook](#configuring-the-webhook).

2. Make sure the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) is installed and you are logged in with `heroku login` in Terminal

3. Create a new Heroku app in the CLI or on heroku.com. To deploy to an existing Heroku app, add the remote with `heroku git:remote -a <name of heroku app>`

4. In the control panel for the app on Heroku.com, click the Resources tab and add a Heroku Postgres addon

5. Also on the Resources tab, add the Heroku Scheduler addon. Go into the addon settings, then create a new daily job that runs `node update_hashes.js`

6. Back on your CLI, add the GitHub webhook secret with `heroku config:set WEBHOOK_KEY=<key>`

7. Add a GitHub personal access token with `heroku config:set GITHUB_TOKEN=<token>`. This [personal access token](https://github.com/settings/tokens) should have the `public_repo` scope only

8. Push the app with `git push heroku master`

9. Populate the database with `heroku run node seed.js`

## Configuring the webhook

The data for this app comes from the [datarightsfinder/data](https://github.com/datarightsfinder/data) repository on GitHub.

Whenever a push to master is made in this repository, GitHub will send information about what has changed to this app. It will then update the internal database to reflect the modifications in this GitHub repository.

### For local installations

1. Install [ngrok](https://ngrok.com/)

2. Follow the instructions to install Data Rights Finder locally

3. Run the app with `gulp`

4. In another Terminal tab, run ngrok with `./ngrok http 3000 -region eu`

5. Go to [https://github.com/datarightsfinder/data/settings/hooks](https://github.com/datarightsfinder/data/settings/hooks) and click "Add Webhook".

6. In "Payload URL", paste in the http forwarding address from ngrok, and add `/webhook/incoming` to the end. For example, `http://abcd1234.eu.ngrok.io/webhook/incoming`

7. In "Content Type", choose `application/json`

8. In "Secret", use a password manager to generate a long, random password. Paste this in, and store it somewhere safe

9. In "Which events would you like to trigger this webhook?" choose "Just the `push` event"

10. Click "Add Webhook"

### For Heroku installations

Follow steps 5 to 10 for configuring the webhook locally.

## App configuration

* `/settings.yaml` This file contains the main settings for the app, including its name, URL and references to email addresses and GitHub repositories

* `/config/message_templates.js` This file contains the templates used when clicking email links for exercising rights

## Updates to privacy notices

Data Rights Finder is configured to run a script once a day that hashes the text contents of a privacy policy. If the hash has changed since it was last checked, it will appear on the [changes page](https://datarightsfinder.org/changes) at [https://datarightsfinder.org/changes](https://datarightsfinder.org/changes).

To resolve a change, make an edit to its corresponding JSON file and commit it to the data repository.

To run this script manually, run `node update_hashes.js` locally or `heroku run node update_hashes.js` remotely.

## Scripts

* `node seed.js` This command is automatically run when installing this project for the first time. If you need to reset the data in your local database with data from GitHub, run this command.

* `node update_hashes.js` This command checks each privacy notice and lists any content changes at [https://datarightsfinder.org/changes](https://datarightsfinder.org/changes).
