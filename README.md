# EventSphere

Event and expo management built with React, Vite, Tailwind CSS, Express and MongoDB.

## Local development

Install dependencies in both applications:

```sh
npm --prefix Backend install
npm --prefix Frontend install
```

Run these commands in separate terminals:

```sh
npm --prefix Backend run dev
npm --prefix Frontend run dev
```

The backend defaults to port 3000. Vite serves the frontend on port 5173. Keep environment values in each application's local .env file. Backend configuration is documented in [Backend/README.md](Backend/README.md).

## Project structure

- Frontend/src/page: public pages and dashboards
- Frontend/src/components: shared forms, navigation and UI components
- Backend/src/routes: API routes and access rules
- Backend/src/controllers: request handling
- Backend/src/models: MongoDB models
- Backend/src/services: booking, validation and notification logic
- Backend/tests: isolated regression tests

## Checks

```sh
npm --prefix Frontend run lint
npm --prefix Frontend run build
npm --prefix Backend run check:syntax
npm --prefix Backend test
```
