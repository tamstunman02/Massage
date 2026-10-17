# Massage

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Database (PostgreSQL)

The API in `server/` stores users, providers, bookings, favorites, applications and uploaded media in PostgreSQL.
Tables and demo data are created automatically on first start. Set `DATABASE_URL` to use your own server
(default: `postgres://postgres:postgres@localhost:5432/massage`, the database must use UTF8 encoding).

```sh
npm run db:local   # optional: local PostgreSQL without installing anything (data in .pgdata)
npm run server     # API on http://localhost:3001
npm run dev        # Vite dev server, proxies /api and /uploads to the API
```

Demo accounts: `admin@example.com / admin123`, `mali@example.com / seller123`, `somchai@example.com / buyer123`.
Role permissions live in `server/roles.json`. Uploaded media is saved in `server/uploads`.
Provider profiles show the first uploaded image as the profile avatar; all profile photos and videos can be opened in a navigable viewer.
Tourists can review a provider after a completed booking, rate service and value from 1–5 stars, and attach up to six images.
Active demo provider profiles include clearly labeled sample tourist experiences for preview; these examples are stored separately from submitted reviews.
Providers can add and remove 1–30 appointment service entries in their profile settings, including each service's name, duration, description, and price. Tourists can select an offered service when booking. Providers can also define 1–30 meeting modes (up to 60 characters each); the legacy “นอกสถานที่” option retains its travel surcharge and location field.
The demo catalog includes at least 3 fictional adult (18+) profiles for each of Thailand's 77 provinces.
Provider profiles include editable age, height, weight, and measurements; these details appear on search cards while profile descriptions remain on the full profile page.
These are sample records for testing only, not real people or service listings.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
