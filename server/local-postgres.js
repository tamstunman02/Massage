// Starts a local PostgreSQL (no installation needed) for development.
// Skip this if you already have PostgreSQL and set DATABASE_URL instead.
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import path from 'node:path'

const databaseDir = path.resolve('.pgdata')
const pgServer = new EmbeddedPostgres({
  databaseDir, user: 'postgres', password: 'postgres', port: 5432, persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
  })

if (!existsSync(path.join(databaseDir, 'PG_VERSION'))) await pgServer.initialise()
await pgServer.start()
try {
  await pgServer.createDatabase('massage')
} catch {
  // database already exists
}
console.log('PostgreSQL ready on postgres://postgres:postgres@localhost:5432/massage')

const stop = async () => {
  await pgServer.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
