# Boop

Boop is an app that uses spontaneous push notifications to remind friends to chat with each other online.
We developed this concept as a project for Georgia Tech's 2-semester Junior Design course. At the height of the
COVID-19 pandemic, with most of our team taking classes remotely, we noticed that we missed those unplanned
social interactions that happen when you cross paths with a friend at the dining hall or see someone you know while
walking to class. Boop is designed to replicate the social benefits of these spontaneous moments by prompting users
to reach out to their friends and start a conversation when they wouldn't otherwise.

We used an AWS free trial, so unfortunately we have had to close down the web-app after the end of the project.
You can still view [a video demo of the application](https://www.youtube.com/watch?v=Wm0xUE4BuX0) or read
[our design document and UI screenshots](https://github.com/GRarer/boop/blob/main/docs/boop_design_documentation.pdf).


## Installation Guide for Developers and Contributors


You can clone or fork the Boop source code from https://github.com/GRarer/boop/

### Dependency Installation
This project uses [NPM](https://www.npmjs.com/) as a package manger, and is divided into three Node packages: one for
the NodeJS-based backend, one for the Angular-based frontend, and a "core" package that is a decency for both the
front-end and back-end. Navigate to the `/core`, `/backend`, and `/frontend` directories and run `npm ci` in each
to install the dependencies.

You will also need to install [PostgreSQL](https://www.postgresql.org/download/) version 12 or 13, which provides the
SQL relational database system used by the backend. You may need to add the Postgres `psql` command-line
program to your path environment variable to be able to run the database initialization script.

### How to Run Boop Locally

#### Initializing the database

`init.sql` contains the sql script that sets up the database tables. To set up or reset the database, you can run
this script from `psql` in your terminal. Note that re-initializing your local copy of the database completely resets
it.

On Windows, the default Postgres superuse is called `postgres`. On Unix platforms, it may be your system username.

```sh
$ psql -U <your Postgres username>
<enter your Postgres user password>
\i init.sql
```

`init.sql` is located in the top directory of this project. You can also find the `initialize_examples.sql` script; run
this after `init.sql` to set up testing example accounts.

### Building The Core Package

The `core` package contains type definitions and utilities that are common to both the frontend and backend. It is a
dependency for the backend and frontend, so you'll need to build the latest version of `core` before building the
frontend or backend. Navigate to the core directory and run `npm run build`.

### Running a Local Instance of the Boop Backend

Before you run your local version of Boop, you will need to configure the environment variables for your backend.

#### Generating VAPID keys

Boop uses the web push protocol to send notifications, which requires a VAPID key pair.
You can generate a new key pair for your instance of the Boop server by running
`npx web-push generate-vapid-keys`.

#### Backend environment variables
The Boop backend uses [dotenv](https://www.npmjs.com/package/dotenv) so that you can configure the backend environment
variables by creating a file called `/backend/.env`. The environment variables used by Boop are:

- `BOOP_VAPID_PUBLIC_KEY` public half of a VAPID key pair for web push notifications
- `BOOP_VAPID_PRIVATE_KEY` private half of a VAPID key pair for web push notifications
- `PORT` port for Express server. Defaults to 3000.
- `PGUSER` username to use to connect to Postgres. Defaults to 'postgres'.
- `PGPASSWORD` password to use to connect to Postgres.
- `PGHOST` host url of Postgres server. Defaults to 'localhost'.

#### Backend server command line options:
- `--pg-password <your Postgres password>` password to use to connect to Postgres. Overrides "PGPASSWORD" environment
    variable.
- `--pg-user <your Postgres username>` username to use to connect to Postgres. Overrides "PGUSER" environment variable.
- `--frequent-push` speeds up the frequency of push notifications to several per minute instead of once every few hours,
    for testing the push notification system


### Running the Angular Frontend Locally

First navigate your terminal to the frontend directory. Run `npx ng serve` for a dev server.
Navigate to `localhost:4200/`. The app will automatically reload if you change any of the source files.

However, the `ng serve` dev server does not support service workers; this means that push notifications and other PWA
features are unavailable in this mode.

### Running the Angular Frontend Locally with Service Workers Enabled

To build a version with service workers included and run it with a local http server, use `npm run start-pwa` and
navigate to `localhost:8080/`. Note that this server will **not** automatically recompile and reload when you make
changes.

The service worker caches the application to improve load times, but this means that when you first open
`localhost:8080/` after recompiling, the browser will show an old version of the application that has been cached.
The service worker waits up to 30 seconds before checking for a new version, so to see your most recent changes you will
need to open the page, wait 30 seconds, and then refresh.

### Style Checking

Navigate to either the frontend, backend, or core directory and run `npm run lint` to run the eslint style checker on
that package. Some formatting issues can be automatically fixed with `npm run lint -- --fix`. In addition to ensuring
consistent formatting, the linter will warn about code that may lead to errors or unintentional behavior, such as
misused promises. You can also use the `lint.sh` shell script to run linters on all three modules.

GitHub actions is also configured to automatically run linting on all pull requests and block changes that would cause
linter warnings or errors.

You may want use the `.editorconfig` file to ensure that your editor or IDE uses 2-space indentation, removes trailing
whitespace, etc. For Visual Studio Code, this requires installing
[a plugin](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig).

### Strict Types
Be aware that this project uses TypeScript in `--strict` mode. This disallows implicit `any`, enforces strict null
checking to prevent null-pointer bugs, etc.
See [the typescript compiler options documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
for details.


## Installation Guide for Deploying Boop to Production

We deployed the Boop prototype at https://boopboop.app using GitHub pages and AWS. If you want to deploy your own
instance of Boop, you will first want to make a few changes to the code.
- update the FAQ, Terms of Service, and Privacy Policy to refer to your organization and your Boop instance's URL.
- update the backend base url in `/frontend/environment.prod.ts` to point to your instance's backend server.
- update the URLs of icons that are used in notification metadat
- generate a new VAPID key-pair and make sure that your VAPID private key is kept secret
- if you are not planning to use GitHub Actions to deploy your front-end to GitHub Pages, remove `deploy_site.yaml` from
`.github/workflows`

### Hosting the Production Frontend

To build the production frontend, navigate to `/frontend` and run `npm run build-prod`. This will build the front-end
with service workers enabled and with Angular ahead-of-time compilation optimizations. The production frontend will
be set to send its API requests to the production backend URL defined in `/frontend/environment.prod.ts` rather than
trying to access the server on localhost.

The compiled frontend will be output to `/frontend/dist`. We serve our frontend with GitHub pages, but you can use
any static-site hosting option. We use GitHub actions to automatically redeploy the static site when PRs are merged into
the main branch.

### Hosting the Production Backend

We host our production Postgres database on Amazon RDS, but you can use any Postgres hosting option or host the database
on your own servers. You simply need to configure the environment variables of your production backend with the
username, password, and host URL needed to access your database.

You can host your production backend server on any device that can run NodeJS. We use an Amazon Ec2 instance, with
Nginx as the reverse proxy to allow incoming internet traffic. We recommend purchasing a domain, with te apex domain
and `www` subdomain pointing to your frontend's static site host and the `api` subdomain pointing to your backend
server's reverse proxy.

To make sure that the NodeJS server restarts if anything goes wrong, you can use either systemd or the "forever" npm
package to keep it running continuously.

### Troubleshooting and Potential Issues For Deployment

If you use GitHub pages as your static site host, GitHub will only automatically generate an SSL certificate for the
main domain that you use (e.g. `boopboop.app`) and not any additional subdomains (e.g. `www.boopboop.app`). If you use
a TLD like `.app` that disallows HTTP, then users will not be able to connect through the additional subdomains.
We solved this by switching out GitHub pages site to use the `www` subdomain long enough for the SSL certificate to
be generated and then switching back, but this would require repeating this workaround every few months to prevent
the certificate from expiring, so we do not recommend using GitHub pages as the host for a long-term production
deployment.

If you try to compile your backend on the same machine that you serve the backend from (e.g. an AWS EC2 instance),
you may find that needed dependencies are not installed to `node_modules` even when running `npm ci` or `npm install`.
This is most likely caused by the `$NODE_ENV` environment variable being set to `production`, which causes npm to skip
installing dev dependencies, including the TypeScript compiler. You should unset the `$NODE_ENV` on machines that you
use for compilation.

## Release Notes

The Boop web-app uses continuous integration. This changelog shows major milestones, but some of these milestones
correspond to several smaller changes deployed over multiple days.

We set a code-freeze deadline for ourselves to have the development of Boop finished by the end of March.
We met this goal and completed all of the features planned in our original design, as well as several smaller
additions and stretch goals such as friend request notifications and data portability.

### 2020-03-30
Final Boop release before end-of-semester code-freeze

Features:
- users can now export their data to JSON, in compliance with GDPR data portability requirements
- adds a dialog warning when users access Boop from a browser or device that does not support web push notifications
- improves privacy policy with a guarantee to never sell user data
- adds ARIA labels to images and buttons that did not already have descriptive text
- minor UI improvements
- adds Instagram, Google Hangouts, and Skype to chat platforms drop-down
- adds more formats of reminder notification messages

Bugfixes:
- improved detection of platforms that do not support web push notifications (e.g. Safari)

### 2020-03-24
This release makes several user interface improvements inspired by user feedback:
- adds a "home" icon to the top of the page as a more intuitive way to navigate out of menus (issue #100)
- show outgoing friend requests on the friends page, and allow users to cancel friend requests after they have
sent them (resolves #102)
- improve responsiveness and efficiency of friends page
- add FAQ dialog to landing page (issue #66 and issue #67)
- remove extraneous front-end logging
- update terms of service and privacy policy

### 2021-03-22
Features:
- overhauls registration and onboarding with a new, easier-to-navigate registration page
- adds icon and badge to push notifications
- increases notification cooldown time and decreases notification frequency based on user feedback

Bugfixes:
- prevents notifications disappearing without opening the app if the user clicks on the notification body
rather than the action buttons (issue #96)

### 2021-03-18
This release makes several improvements to notifications

Features:
- the notifications when someone sends you a friend request or accepts your friend request now show their name in
the notification message

Bugfixes:
- fixes a bug where users who had do-not-disturb mode enabled or had already recieved a reminder notification in the
last 4 hours still had a change to be sent a reminder notification (issue #88)
- fixes "you are friends with this user" and "you sent a friend request to this user" text being invisible on the
profile page because of a bug in Angular SCSS minification (issue #81)
- fixes the Boop icon being cropped incorrectly when installed as a PWA on Android (issue #85)

### 2021-03-16
First production deployment of the Boop application. Features supported at launch include:
- registration, login, and collection of contact information
- friends list and friend requests
- user profiles, status messages, and privacy options
- spontaneous push notifications
