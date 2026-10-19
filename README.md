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
Tables and seed data are created automatically on first start. Set `DATABASE_URL` to use your own server
(default: `postgres://postgres:postgres@localhost:5432/massage`, the database must use UTF8 encoding).

```sh
npm run db:local   # optional: local PostgreSQL without installing anything (data in .pgdata)
npm run server     # API on http://localhost:3001
npm run dev        # Vite dev server, proxies /api and /uploads to the API
```

Seed accounts: `admin@example.com / admin123`, `mali@example.com / seller123`, `somchai@example.com / buyer123`.
Role permissions live in `server/roles.json`. Uploaded media is saved in `server/uploads`.
Provider profiles show the first uploaded image as the profile avatar; all profile photos and videos can be opened in a navigable viewer.
Tourists can leave reviews on provider profiles (service and value ratings, optional images).
Providers can add and remove 1–30 service entries in their profile settings, including each service's name, duration, description, and price. Providers can also define meeting modes.
The catalog seeds multiple profiles per province across Thailand.
Provider profiles include editable age, height, weight, and measurements; these details appear on search cards while profile descriptions remain on the full profile page.

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

## CI/CD

Workflow อยู่ที่ `.github/workflows/ci-cd.yml`

- **CI** รันเมื่อเปิด pull request หรือ push เข้า `main`: ติดตั้งแพ็กเกจ, build หน้าเว็บ, แล้วเปิด API กับ PostgreSQL ชั่วคราวเพื่อตรวจว่า `/api/me` ตอบกลับ
- **CD** รันเฉพาะตอน push เข้า `main` และเปิดตัวแปร `DEPLOY_ENABLED=true` แล้วเท่านั้น เซิร์ฟเวอร์จะ `git pull`, build แล้ว restart service `massage`

ไฟล์ตัวอย่างสำหรับเซิร์ฟเวอร์อยู่ใน `deploy/` (`massage.service`, `nginx.conf.example`, `env.example`)
