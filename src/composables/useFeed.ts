import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import type { SiteConfig } from '../../shared/config'
import { feedSchema, parseFeed, type Article, type FeedResult } from '../../shared/feed'

export function useFeed(blog: SiteConfig['blog']) {
  const snapshot = inject<FeedResult | undefined>('staticFeed', undefined)
  const editorPreview = inject('editorPreview', false)
  const articles = ref<Article[]>(snapshot?.articles ?? [])
  const loading = ref(!snapshot)
  const failed = ref(false)
  const stale = ref(false)
  let controller: AbortController | undefined
  let refresh: ReturnType<typeof setInterval> | undefined

  async function load() {
    controller?.abort()
    const current = new AbortController()
    controller = current
    loading.value = true
    failed.value = false
    const timer = setTimeout(() => current.abort(), 15_000)
    try {
      if (!blog.feedUrl) { articles.value = []; stale.value = false; return }
      const url = editorPreview ? '/__edit/api/feed' : blog.mode === 'direct' ? blog.feedUrl : blog.mode === 'snapshot' ? '/feed.json' : `/api/feed${location.pathname === '/' ? '' : `?page=${encodeURIComponent(location.pathname)}`}`
      const response = await fetch(url, { signal: current.signal, cache: 'no-store', credentials: 'omit', ...(editorPreview ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Upage-Editor': '1' }, body: JSON.stringify(blog) } : {}) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (blog.mode === 'direct' && !editorPreview) {
        const text = await response.text()
        if (text.length > 2 * 1024 * 1024) throw new Error('订阅过大')
        articles.value = parseFeed(text, new URL(blog.feedUrl, location.href).href, blog.limit)
        stale.value = false
      } else {
        const feed = feedSchema.parse(await response.json())
        articles.value = feed.articles.slice(0, blog.limit)
        stale.value = feed.stale
      }
    } catch {
      if (controller !== current) return
      failed.value = !articles.value.length
      stale.value = !!articles.value.length
    } finally {
      clearTimeout(timer)
      if (controller === current) loading.value = false
    }
  }
  onMounted(() => {
    if (snapshot) return
    void load()
    if (blog.mode !== 'snapshot') refresh = setInterval(() => { if (document.visibilityState === 'visible') void load() }, blog.cacheMinutes * 60_000)
  })
  onBeforeUnmount(() => { controller?.abort(); controller = undefined; clearInterval(refresh) })
  return { articles, loading, failed, stale, load }
}
