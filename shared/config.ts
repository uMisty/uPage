import { z } from 'zod'

const text = z.string().trim()
const httpUrl = text.refine(value => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}, '请填写完整的 HTTP(S) 地址')
const optionalUrl = z.union([z.literal(''), httpUrl]).default('')
const asset = text.refine(value => !value || /^(https?:\/\/|\/(?!\/))/.test(value), '素材须使用站内绝对路径或 HTTP(S) 地址')
const color = text.regex(/^#[\da-f]{6}$/i, '颜色格式为 #RRGGBB')
const heading = z.object({ eyebrow: text, title: text, moreLabel: text.default('') })
export const projectSchema = z.object({
  name: text.min(1), description: text, summary: text.optional(), tags: z.array(text).default([]),
  image: asset.default(''), imageAlt: text.default(''), background: color.default('#DFE6D5'),
  demoUrl: optionalUrl, githubUrl: optionalUrl, releasedAt: text.default(''),
  featured: z.boolean().default(false), releaseLabel: text.default('主推作品'),
})
export const configSchema = z.object({
  version: z.literal(1),
  site: z.object({ title: text.min(1), description: text, lang: text.default('zh-CN'), footer: text, footerLabel: text, footerUrl: optionalUrl }),
  theme: z.object({ background: color, text: color, muted: color, accent: color, line: color, dark: color, soft: color }),
  profile: z.object({
    eyebrow: text, name: text.min(1), suffix: text.default('.'), headline: text,
    headlineLines: z.array(text).default([]), bio: z.array(text), motto: z.array(text),
    image: asset, imageAlt: text, blogLabel: text, projectsLabel: text,
  }),
  sections: z.object({
    projects: heading.extend({ moreUrl: optionalUrl }),
    writing: heading, tools: heading.extend({ description: text }),
    interests: heading.extend({ description: text }),
  }),
  labels: z.object({ demo: text, source: text, noProjectLinks: text, projectDateSuffix: text, retry: text, loading: text, emptyFeed: text, feedError: text, staleFeed: text }),
  projects: z.array(projectSchema),
  blog: z.object({
    enabled: z.boolean().default(true), url: optionalUrl,
    feedUrl: z.union([httpUrl, z.literal('/feed.xml'), z.literal('')]),
    mode: z.enum(['server', 'direct', 'snapshot']).default('server'),
    limit: z.number().int().min(1).max(20).default(3),
    cacheMinutes: z.number().int().min(1).max(1440).default(10),
    showReadingTime: z.boolean().default(true),
    defaultCategory: text.default('随笔'),
  }),
  now: z.object({ enabled: z.boolean(), eyebrow: text, title: z.array(text), updatedLabel: text, items: z.array(z.object({ label: text, text })) }),
  toolGroups: z.array(z.object({ name: text, items: z.array(z.object({ name: text, purpose: text, icon: asset.default(''), mark: text.default(''), url: optionalUrl })) })),
  interests: z.array(z.object({ name: text, description: text, image: asset.default(''), imageAlt: text.default('') })),
  contact: z.object({ enabled: z.boolean(), eyebrow: text, title: text, mobileTitle: text, description: text, mobileDescription: text, email: z.union([z.literal(''), z.email()]) }),
})
export type SiteConfig = z.infer<typeof configSchema>
export type Project = z.infer<typeof projectSchema>

export function releaseTime(project: Project): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(project.releasedAt)) return -Infinity
  const time = Date.parse(`${project.releasedAt}T00:00:00Z`)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === project.releasedAt ? time : -Infinity
}

export function selectFeatured(projects: Project[]): number {
  if (!projects.length) return -1
  const pinned = projects.map((project, index) => project.featured ? index : -1).filter(index => index >= 0)
  const candidates = pinned.length ? pinned : projects.map((_, index) => index)
  return candidates.reduce((best, index) => releaseTime(projects[index]!) > releaseTime(projects[best]!) ? index : best, candidates[0]!)
}
