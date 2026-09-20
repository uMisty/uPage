import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { decodeHTML } from 'entities'
import { z } from 'zod'

export const articleSchema = z.object({
  title: z.string(), url: z.url().refine(url => /^https?:\/\//.test(url)),
  publishedAt: z.string(), category: z.string(), readingMinutes: z.number().int().positive().nullable(),
})
export const feedSchema = z.object({
  articles: z.array(articleSchema), fetchedAt: z.string(), stale: z.boolean(),
})
export type Article = z.infer<typeof articleSchema>
export type FeedResult = z.infer<typeof feedSchema>

type XmlValue = string | number | boolean | Record<string, any> | null | undefined
const array = <T>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value]
const value = (input: XmlValue): string => input == null ? '' : typeof input === 'object' ? value(input['#text']) : String(input)
export const plainText = (input: XmlValue): string => decodeHTML(value(input).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

function articleUrl(raw: string, base: string): string | null {
  try {
    const parsed = new URL(raw, base)
    return raw && ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password ? parsed.href : null
  } catch { return null }
}

/** RSS 2.0, RSS 1.0 / RDF and Atom. Feed HTML is always displayed as text. */
export function parseFeed(xml: string, baseUrl: string, limit: number): Article[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('不支持包含实体声明的订阅')
  if (XMLValidator.validate(xml) !== true) throw new Error('订阅 XML 格式无效')
  const document = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, parseTagValue: false, processEntities: false }).parse(xml)
  const atom = document.feed
  const root = atom ?? document.rss?.channel ?? document.RDF
  if (root == null) throw new Error('订阅须为 RSS 或 Atom 格式')
  const base = articleUrl(value(root['@_base']), baseUrl) ?? baseUrl
  const rows: Record<string, any>[] = array(atom ? root.entry : root.item)
  const seen = new Set<string>()
  return rows.map((item): Article | null => {
    const link = atom
      ? array<Record<string, any>>(item.link).find(link => !link['@_rel'] || link['@_rel'] === 'alternate')?.['@_href']
      : value(item.link) || (item.guid?.['@_isPermaLink'] !== 'false' ? value(item.guid) : '')
    const url = articleUrl(value(link), articleUrl(value(item['@_base']), base) ?? base)
    const title = plainText(item.title)
    if (!url || !title) return null
    const date = Date.parse(value(item.pubDate ?? item.published ?? item.updated ?? item.date))
    const category = array<XmlValue>(item.category)[0]
    const body = plainText(item.encoded ?? item.content ?? item.description ?? item.summary)
    const chinese = (body.match(/[\u3400-\u9fff]/g) ?? []).length
    const words = body.replace(/[\u3400-\u9fff]/g, ' ').split(/\s+/).filter(Boolean).length
    const explicitMinutes = Number(value(item.readingMinutes))
    return {
      title, url, publishedAt: Number.isFinite(date) ? new Date(date).toISOString() : '',
      category: plainText(typeof category === 'object' && category ? category['@_term'] ?? category : category),
      readingMinutes: Number.isFinite(explicitMinutes) && explicitMinutes > 0 ? Math.ceil(explicitMinutes) : body ? Math.max(1, Math.ceil(chinese / 400 + words / 220)) : null,
    }
  }).filter((item): item is Article => item !== null)
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0))
    .filter(item => { if (seen.has(item.url)) return false; seen.add(item.url); return true })
    .slice(0, Math.min(20, Math.max(1, limit)))
}
