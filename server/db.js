import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'

const DATA_DIR = path.join(import.meta.dirname, 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'editions.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS editions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    html TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

const columns = db.prepare('PRAGMA table_info(editions)').all().map((column) => column.name)
if (!columns.includes('source_filename')) {
  db.exec('ALTER TABLE editions ADD COLUMN source_filename TEXT')
}

export function insertEdition(title, html, sourceFilename) {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO editions (title, html, source_filename) VALUES (?, ?, ?)')
    .run(title, html, sourceFilename)
  return lastInsertRowid
}

export function listEditions() {
  return db.prepare('SELECT id, title, created_at FROM editions ORDER BY id DESC').all()
}

export function getEdition(id) {
  return db.prepare('SELECT id, title, html, created_at, source_filename FROM editions WHERE id = ?').get(id)
}

const deleteAllEditionsTx = db.transaction(() => {
  db.prepare('DELETE FROM editions').run()
  db.prepare("DELETE FROM sqlite_sequence WHERE name = 'editions'").run()
})

export function deleteAllEditions() {
  deleteAllEditionsTx()
}

export function deleteEdition(id) {
  db.prepare('DELETE FROM editions WHERE id = ?').run(id)
}
