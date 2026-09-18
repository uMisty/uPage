import { describe, expect, it, vi } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseFeed } from '../../shared/feed'
import { createFeedService, loadConfig } from '../../server/feed-service'
import { isPublicAddress } from '../../server/remote-feed'

const rss = (body: string) => `<rss version="2.0"><channel>${body}</channel></rss>`
describe('RSS / Atom 解析', () => {
  it('读取本地真实 XML 示例', async () => {
    const articles = parseFeed(await readFile('public/feed.xml', 'utf8'), 'https://example.com', 3)
    expect(articles).toHaveLength(3)
    expect(articles[0]).toMatchObject({ title: '让个人主页更像你自己', readingMinutes: 5, category: '设计思考' })
  })
  it('排序、去重、限制条数并剔除危险 URL', () => {
    const xml = rss('<item><title>Old</title><link>/old</link><pubDate>2025-01-01</pubDate></item><item><title>New</title><link>/new</link><pubDate>2026-01-01</pubDate></item><item><title>Duplicate</title><link>/new</link></item><item><title>Danger</title><link>javascript:alert(1)</link></item>')
    expect(parseFeed(xml, 'https://example.com/feed', 2).map(item => item.title)).toEqual(['New', 'Old'])
    expect(parseFeed(xml, 'https://example.com/feed', 1)).toHaveLength(1)
  })
  it('解析带命名空间的 Atom、相对链接、分类和缺失日期', () => {
    const xml = '<feed xmlns="http://www.w3.org/2005/Atom" xml:base="https://blog.example.com/"><entry><title>A &amp; B</title><link rel="self" href="/feed/1"/><link rel="alternate" href="/post/1"/><category term="开发"/><content type="html">&lt;p&gt;Hello&lt;/p&gt;</content></entry></feed>'
    expect(parseFeed(xml, 'https://example.com/atom.xml', 3)[0]).toMatchObject({ title: 'A & B', url: 'https://blog.example.com/post/1', category: '开发', publishedAt: '' })
  })
  it('支持 RDF、单条 RSS、CDATA 标题和非永久 GUID', () => {
    const xml = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><item><title><![CDATA[<b>标题</b>]]></title><link>https://example.com/a</link><dc:date>2026-09-01</dc:date></item></rdf:RDF>'
    expect(parseFeed(xml, 'https://example.com', 3)[0]?.title).toBe('标题')
    expect(parseFeed(rss('<item><title>Not a URL</title><guid isPermaLink="false">identifier</guid></item>'), 'https://example.com', 3)).toEqual([])
  })
  it('空订阅有效，畸形 XML、HTML 页面和实体声明报错', () => {
    expect(parseFeed(rss(''), 'https://example.com', 3)).toEqual([])
    expect(() => parseFeed('<rss><channel>', 'https://example.com', 3)).toThrow()
    expect(() => parseFeed('<html><body>Error</body></html>', 'https://example.com', 3)).toThrow()
    expect(() => parseFeed('<!DOCTYPE rss><rss/>', 'https://example.com', 3)).toThrow()
  })
})

describe('订阅服务', () => {
  it('缓存请求，过期失败返回旧文章，配置改变后不返回旧来源', async () => {
    const config = await loadConfig(resolve('public'))
    config.blog.feedUrl = 'https://example.com/rss'
    let time = 1_000_000
    const fetcher = vi.fn().mockResolvedValue(rss('<item><title>Saved</title><link>https://example.com/a</link></item>'))
    const getFeed = createFeedService(resolve('public'), fetcher, () => time)
    expect((await getFeed(config)).stale).toBe(false)
    await getFeed(config)
    expect(fetcher).toHaveBeenCalledTimes(1)
    time += 11 * 60_000
    fetcher.mockRejectedValue(new Error('offline'))
    expect((await getFeed(config)).stale).toBe(true)
    config.blog.feedUrl = 'https://example.org/rss'
    await expect(getFeed(config)).rejects.toThrow('offline')
  })
  it('并发访问合并为一个上游请求', async () => {
    const config = await loadConfig(resolve('public'))
    config.blog.feedUrl = 'https://example.com/rss'
    const fetcher = vi.fn().mockResolvedValue(rss(''))
    const getFeed = createFeedService(resolve('public'), fetcher)
    await Promise.all([getFeed(config), getFeed(config), getFeed(config)])
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('拒绝私网、回环、链路本地、映射 IPv6 地址', () => {
    for (const address of ['127.0.0.1', '10.0.0.1', '172.16.1.1', '192.168.1.1', '169.254.169.254', '::1', '::ffff:127.0.0.1', 'fc00::1', '0.0.0.0']) expect(isPublicAddress(address), address).toBe(false)
    expect(isPublicAddress('1.1.1.1')).toBe(true)
    expect(isPublicAddress('2606:4700:4700::1111')).toBe(true)
  })
})
