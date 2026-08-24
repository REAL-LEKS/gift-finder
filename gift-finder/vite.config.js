import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { searchJumia } from './api/_lib/jumia-scraper.mjs'
import { searchKonga } from './api/_lib/konga-scraper.mjs'

// Serves /api/jumia-search and /api/konga-search locally (dev + preview)
// using the exact same scraper modules as the production functions.
function storeApiPlugin() {
  function makeHandler(searchFn) {
    return async (req, res) => {
      const q = new URL(req.url, 'http://localhost').searchParams.get('q')?.trim()
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')

      if (!q) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Missing ?q= query' }))
        return
      }

      try {
        const data = await searchFn(q)
        res.statusCode = 200
        res.end(JSON.stringify(data))
      } catch (err) {
        res.statusCode = 502
        res.end(JSON.stringify({ error: err.message, live: false }))
      }
    }
  }

  return {
    name: 'store-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/jumia-search', makeHandler(searchJumia))
      server.middlewares.use('/api/konga-search', makeHandler(searchKonga))
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/jumia-search', makeHandler(searchJumia))
      server.middlewares.use('/api/konga-search', makeHandler(searchKonga))
    },
  }
}

export default defineConfig({
  plugins: [react(), storeApiPlugin()],
})
