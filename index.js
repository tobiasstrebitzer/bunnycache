#!/usr/bin/env node
const { existsSync, readFileSync } = require('fs')
const { resolve } = require('path')
const fetch = require('node-fetch').default

async function main() {
  const token = process.env.BUNNYCDN_TOKEN
  const arg = process.argv.slice(-1).pop()
  const path = resolve(arg.endsWith('.json') ? arg : '.cacherc.json')
  if (!existsSync(path)) { throw new Error('missing .cacherc.json') }
  const urls = readFileSync(path, 'utf8').split('\n').reduce((arr, line) => {
    const url = line.trim()
    if (url && !arr.includes(url)) { arr.push(url) }
    return arr
  }, [])
  const results = await Promise.all(urls.map((url) => {
    const cacheUrl = `https://bunnycdn.com/api/purge?url=${encodeURI(url)}`
    return fetch(cacheUrl, { method: 'POST', headers: { 'AccessKey': token } }).then(() => true).catch(() => false)
  }))
  console.info('[PURGED]', results.filter((ok) => ok).length)
  console.info('[FAILED]', results.filter((ok) => !ok).length)
}

main()
