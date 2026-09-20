import type { IncomingMessage, ServerResponse } from 'node:http'
import { createFeedService, loadConfig } from './feed-service'
import { loadPages } from './editor'

export function feedMiddleware(root: string) {
  const getFeed = createFeedService(root)
  return async (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    const pathname = (request.url ?? '').split('?')[0]
    if (pathname !== '/api/feed') return next()
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Cache-Control', 'no-store')
    if (request.method !== 'GET') { response.writeHead(405, { Allow: 'GET' }); response.end(JSON.stringify({ error: 'Method not allowed' })); return }
    try {
      const route = new URL(request.url!, 'http://localhost').searchParams.get('page') || '/'
      const config = (await loadPages(root)).pages.find(page => page.route === (route.endsWith('/') ? route : `${route}/`))?.config ?? await loadConfig(root)
      response.end(JSON.stringify(await getFeed(config)))
    }
    catch (error) {
      console.error('[uPage RSS]', error instanceof Error ? error.message : error)
      response.statusCode = 502
      response.end(JSON.stringify({ error: '暂时无法读取博客订阅，请稍后重试。' }))
    }
  }
}
