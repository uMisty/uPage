import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createFeedService, loadConfig } from '../server/feed-service'

const root = resolve('dist')
const config = await loadConfig(root)
const feed = await createFeedService(root)(config)
await writeFile(resolve(root, 'feed.json'), JSON.stringify(feed, null, 2))
config.blog.mode = 'snapshot'
await writeFile(resolve(root, 'site.config.json'), JSON.stringify(config, null, 2))
console.log(`静态构建完成：已从 RSS 同步 ${feed.articles.length} 篇文章。重新构建可获取最新文章。`)
