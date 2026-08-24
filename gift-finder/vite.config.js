import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { searchJumia } from './api/_lib/jumia-scraper.mjs'

// Serves /api/jumia-search locally (dev + preview) using the exact same
// scraping module as the Vercel/Netlify production functions.
function jumiaApiPlugin() {
  async function handle(req, res) {
    const q = new URL(req.url, 'http://localhost').searchParams.get('q')?.trim()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')

    if (!q) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'Missing ?q= query' }))
      return
    }

    try {
      const data = await searchJumia(q)
      res.statusCode = 200
      res.end(JSON.stringify(data))
    } catch (err) {
      res.statusCode = 502
      res.end(JSON.stringify({ error: err.message, live: false }))
    }
  }

  return {
    name: 'jumia-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/jumia-search', handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/jumia-search', handle)
    },
  }
}

export default defineConfig({
  plugins: [react(), jumiaApiPlugin()],
})
