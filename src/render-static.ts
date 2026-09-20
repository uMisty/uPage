import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ProfilePage from './components/ProfilePage.vue'
import type { PageDocument } from '../shared/pages'
import type { FeedResult } from '../shared/feed'
export async function render(page: PageDocument['pages'][number], feed: FeedResult) {
  const app = createSSRApp({ render: () => h(ProfilePage, { config: page.config, layout: page.layout }) })
  app.provide('staticFeed', feed)
  return renderToString(app)
}
