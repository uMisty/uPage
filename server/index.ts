import { createServer } from 'node:http'
import { resolve } from 'node:path'
import sirv from 'sirv'
import { feedMiddleware } from './middleware'
import { loadConfig } from './feed-service'

const root = resolve('dist')
await loadConfig(root)
const feed = feedMiddleware(root)
const staticFiles = sirv(root, {
  etag: true,
  setHeaders(response, pathname) {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Cache-Control', pathname.endsWith('site.config.json') ? 'no-store' : pathname.includes('/assets/') ? 'public, max-age=86400' : 'no-cache')
  },
})
const server = createServer((request, response) => {
  void feed(request, response, () => staticFiles(request, response, () => { response.statusCode = 404; response.end('Not found') }))
})
const port = Number(process.env.PORT || 3000)
server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`uPage running at http://${process.env.HOST || '127.0.0.1'}:${port}`))
