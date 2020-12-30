# Boop Angular WebApp Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.8.

## Setup

This project uses [NPM](https://www.npmjs.com/) as its package manager. Install npm, then run `npm install` from the web-app directory to install the dependencies.

## Development server

Run `npx ng serve` for a dev server. Navigate to `localhost:4200/`. The app will automatically reload if you change any of the source files.

However, the `ng serve` dev server does not support service workers; this means that push notifications and other PWA features are unavailable in this mode. To build a version with service workers included and run it with a local http server, use `npm run start-pwa` and navigate to `localhost:8080/`. Note that this server will **not** automatically recompile and reload when you make changes. Since service workers can cache applications, you may also need to fully close the tab and re-open it for changes to take effect.

## Strict typechecking
Be aware that this project uses TypeScript in `--strict` mode. This disallows implicit `any`, enforces strict null checking to prevent null-pointer bugs, etc. See [the typescript compiler options documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for details.
