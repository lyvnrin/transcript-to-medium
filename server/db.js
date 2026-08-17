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

export function insertEdition(title, html) {
  const { lastInsertRowid } = db.prepare('INSERT INTO editions (title, html) VALUES (?, ?)').run(title, html)
  return lastInsertRowid
}

export function listEditions() {
  return db.prepare('SELECT id, title, created_at FROM editions ORDER BY id DESC').all()
}

export function getEdition(id) {
  return db.prepare('SELECT id, title, html, created_at FROM editions WHERE id = ?').get(id)
}
