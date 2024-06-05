import fs from 'fs'
export function readJsonFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}