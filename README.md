# Boop

## Setup

This project uses [NPM](https://www.npmjs.com/), the package manager for the JavaScript/TypeScript/Node ecosystem.
With NPM installed, navigate to the backend, frontend, and core directories and run `npm install` in each to install the
dependencies.

You will also need to install [PostgreSQL](https://www.postgresql.org/download/) version 13, which provides the
SQL relational database system used by the backend. You may need to manually add the Postgres `psql` command-line
program to your path environment variable.

## How to Run

### Initializing the database

`init.sql` should contain the sql script that sets up the database tables. To set up or reset the database, you can run
this script from `psql` in your terminal.

```sh
$ psql -U postgres
<enter your postgres superuser password>
\i init.sql
```

`init.sql` is located in the top directory of this project. You can also find the `initialize_examples.sql` script; run
this after `init.sql` to set up testing example accounts.

## Building The Core Package

The `core` package contains type definitions and utilities that are common to both the frontend and backend. It is a
dependency for the backend and frontend, so you'll need to build the latest version of it before building frontend or
backend. Navigate to the core directory and run `npm run build`. Alternatively, use `npm run build-watch` to continually
run the build and recompile core when you make changes.

### Running the Node backend locally

To build and run the server on localhost, run `npm run serve` from the backend directory.

#### Backend environment variables
- `PORT` port for express server. Defaults to 3000.
- `PGUSER` username to use to connect to postgres. Defaults to 'postgres'.
- `PGPASSWORD` password to use to connect to postgres.
- `PGHOST` host url of Postgres server. Defaults to 'localhost'.

#### Backend server command line options:
- `--pg-password <your postgres password>` password to use to connect to postgres. Overrides "PGPASSWORD" environment variable.
- `--pg-user <your postgres username>` username to use to connect to postgres. Overrides "PGUSER" environment variable.
- `--frequent-push` speeds up the frequency of push notifications to several per minute instead of once every few hours,
    for testing the push notification system


### Running the Angular frontend locally

First navigate your terminal to the frontend directory. Run `npx ng serve` for a dev server.
Navigate to `localhost:4200/`. The app will automatically reload if you change any of the source files.

However, the `ng serve` dev server does not support service workers; this means that push notifications and other PWA
features are unavailable in this mode.

### Running the Angular frontend locally with Service Workers enabled

To build a version with service workers included and run it with a local http server, use `npm run start-pwa` and
navigate to `localhost:8080/`. Note that this server will **not** automatically recompile and reload when you make
changes.

The service worker caches the application to improve load times, but this means that when you first open
`localhost:8080/` after recompiling, the browser will show an old version of the application that has been cached.
Opening the first time causes the service worker to detect the change and download the updated version, but to see the
changed version you must fully close the tab and then navigate there again. (Just reloading the same tab will still show
the cached version.)

## Style Checking

Navigate to either the frontend, backend, or core directory and run `npm run lint` to run the eslint style checker on
that package. Some formatting issues can be automatically fixed with `npm run lint -- --fix`. In addition to ensuring
consistent formatting, the linter will warn about code that may lead to errors or unintentional behavior, such as
misused promises. You can also use the `lint.sh` shell script to run linters on all three modules.

You may want use the `.editorconfig` file to ensure that your editor or IDE uses 2-space indentation, removes trailing
whitespace, etc. For Visual Studio Code, this requires installing
[a plugin](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig).

## Strict Types
Be aware that this project uses TypeScript in `--strict` mode. This disallows implicit `any`, enforces strict null
checking to prevent null-pointer bugs, etc.
See [the typescript compiler options documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
for details.
