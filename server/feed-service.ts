import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { configSchema, type SiteConfig } from '../shared/config'
import { parseFeed, type FeedResult } from '../shared/feed'
import { fetchRemoteFeed } from './remote-feed'

export const loadConfig = async (root: string): Promise<SiteConfig> => configSchema.parse(JSON.parse(await readFile(resolve(root, 'site.config.json'), 'utf8')))

export function createFeedService(root: string, fetcher = fetchRemoteFeed, now = Date.now) {
  let cached: { key: string; timestamp: number; result: FeedResult } | undefined
  let pending: { key: string; promise: Promise<FeedResult> } | undefined
  let retryAfter = 0
  return async function getFeed(config: SiteConfig): Promise<FeedResult> {
    const { blog } = config
    if (!blog.enabled || !blog.feedUrl) return { articles: [], fetchedAt: new Date(now()).toISOString(), stale: false }
    const key = JSON.stringify([blog.feedUrl, blog.limit, blog.cacheMinutes])
    const previous = cached?.key === key ? cached : undefined
    if (previous && now() - previous.timestamp < blog.cacheMinutes * 60_000) return previous.result
    if (previous && now() < retryAfter) return { ...previous.result, stale: true }
    if (pending?.key === key) return pending.promise
    const promise = (async () => {
      try {
        const xml = blog.feedUrl === '/feed.xml' ? await readFile(resolve(root, 'feed.xml'), 'utf8') : await fetcher(blog.feedUrl)
        const articles = parseFeed(xml, blog.feedUrl === '/feed.xml' ? blog.url || 'https://example.com/' : blog.feedUrl, blog.limit)
        const result = { articles, fetchedAt: new Date(now()).toISOString(), stale: false }
        cached = { key, timestamp: now(), result }
        retryAfter = 0
        return result
      } catch (error) {
        if (previous) { retryAfter = now() + 30_000; return { ...previous.result, stale: true } }
        throw error
      }
    })()
    pending = { key, promise }
    try { return await promise } finally { if (pending?.promise === promise) pending = undefined }
  }
}
