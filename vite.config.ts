import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function pwaSw(): Plugin {
  let root = process.cwd()
  let outDir = 'dist'

  return {
    name: 'pwa-sw',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version as string
      const assets = collectAssets(outDir).sort()
      const build = contentStamp(outDir, assets)
      writeFileSync(resolve(outDir, 'sw.js'), renderSw(version, build, assets))
    },
  }
}

function collectAssets(dir: string, prefix = ''): string[] {
  const paths: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'sw.js') continue
    const urlPath = `${prefix}/${entry.name}`
    if (entry.isDirectory()) paths.push(...collectAssets(join(dir, entry.name), urlPath))
    else paths.push(urlPath)
  }
  return paths
}

function contentStamp(outDir: string, assets: string[]): string {
  const hash = createHash('sha256')
  for (const path of assets) {
    hash.update(path)
    hash.update(readFileSync(join(outDir, path.slice(1))))
  }
  return hash.digest('hex').slice(0, 8)
}

function renderSw(version: string, build: string, assets: string[]): string {
  return `const VERSION = ${JSON.stringify(version)}
const BUILD = ${JSON.stringify(build)}
const CACHE = 'ab-' + VERSION
const PRECACHE = ${JSON.stringify(assets)}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('ab-') && key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname === '/sw.js') return
  if (url.searchParams.has('__uncached')) return

  event.respondWith(respond(event.request, url))
})

async function precache() {
  const cache = await caches.open(CACHE)
  await Promise.all(
    PRECACHE.map(async (path) => {
      const response = await fetch(path + '?__uncached=' + VERSION + '-' + BUILD, { cache: 'reload' })
      if (!response.ok) throw new Error('precache failed: ' + path)
      await cache.put(path, response)
    }),
  )
}

async function respond(request, url) {
  const cache = await caches.open(CACHE)
  if (request.mode === 'navigate') {
    const shell = await cache.match('/index.html')
    if (shell) return shell
    return fetch(request)
  }
  const cached = await cache.match(url.pathname)
  if (cached) return cached
  return fetch(request)
}
`
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pwaSw()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
