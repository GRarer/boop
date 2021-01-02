# Boop

## Setup

This project uses [NPM](https://www.npmjs.com/), the package manager for the JavaScript/TypeScript/Node ecosystem.
With NPM installed, navigate to the backend and frontend directories and run `npm install` in each to install the
dependencies for both modules.

## Running the Angular frontend locally

First navigate your terminal to the frontend directory. Run `npx ng serve` for a dev server.
Navigate to `localhost:4200/`. The app will automatically reload if you change any of the source files.

However, the `ng serve` dev server does not support service workers; this means that push notifications and other PWA
features are unavailable in this mode. To build a version with service workers included and run it with a local http
server, use `npm run start-pwa` and navigate to `localhost:8080/`. Note that this server will **not** automatically
recompile and reload when you make changes. Since service workers can cache applications, you may also need to clear
your cache or fully close the tab and re-open it for changes to take effect.

## Running the Node backend locally

To build and run the server on localhost, run `npm run serve` from the backend directory. To run a server that
automatically recompiles and restarts when you make changes, you can use `npm run serve-watch`. To compile the server
without running it, use `npm run build` or `npm run build-watch`.

## Style Checking

Navigate to either the frontend or backend directory and run `npm run lint` to run the eslint style checker on that
package. Some formatting issues can be automatically fixed with `npm run lint -- --fix`.

You may want use the `.editorconfig` file to ensure that your editor or IDE uses 2-space indentation, removes trailing
whitespace, etc. For Visual Studio Code, this requires installing
[a plugin](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig).

## Strict typechecking
Be aware that this project uses TypeScript in `--strict` mode. This disallows implicit `any`, enforces strict null
checking to prevent null-pointer bugs, etc.
See [the typescript compiler options documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
for details.
