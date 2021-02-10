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
\i sql/init.sql
```

## Building The Core Package

The `core` package contains type definitions and utilities that are common to both the frontend and backend. It is a
dependency for the backend and frontend, so you'll need to build the latest version of it before building frontend or
backend. Navigate to the core directory and run `npm run build`. Alternatively, use `npm run build-watch` to continually
run the build and recompile core when you make changes.

### Running the Node backend locally

To build and run the server on localhost, run `npm run serve -- --password <your postgres superuser password>` from the
backend directory. To run a server that automatically recompiles and restarts when you make changes, you can use
`npm run serve-watch -- --password <your postgres superuser password>`. To compile the server without running it,
use `npm run build` or `npm run build-watch`.

If you save your postgres superuser password in an environment variable called `postgres_password`, you can skip the
`-- --password <your postgres password>` part.

By default, the backend will try to connect to postgres as the
user "postgres". On Windows, this user is created during installation. On other platforms, you can either create
a user named "postgres" or start the backend with the `--sqlUser --<your postgres username>` argument to have the
server connect as a different postgres username.

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
