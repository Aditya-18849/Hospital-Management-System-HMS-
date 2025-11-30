import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve logs directory relative to this file in a cross-platform safe way
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOG_DIR = path.resolve(__dirname, '..', '..', 'logs')
const LOG_FILE = path.join(LOG_DIR, 'app.log')

try {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
} catch (e) {
  // ignore directory creation errors; we'll fallback to console
}

const time = () => new Date().toISOString()

function write(level, message) {
  const line = `[${time()}] ${level.toUpperCase()}: ${message}\n`
  try {
    fs.appendFileSync(LOG_FILE, line)
  } catch (e) {
    // fallback to console if file write fails
    // eslint-disable-next-line no-console
    console.error('Failed to write log file', e)
  }
  // eslint-disable-next-line no-console
  if (level === 'error') console.error(line)
  else console.log(line)
}

export default {
  info: (msg) => write('info', msg),
  error: (msg) => write('error', msg),
  warn: (msg) => write('warn', msg)
}
