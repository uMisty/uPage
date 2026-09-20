import { z } from 'zod'
import { configSchema, type SiteConfig } from './config'
import { extraNames } from './extra-sections'

export const sectionNames = { profile: '个人介绍', projects: '作品项目', writing: '博客与近况', tools: '工具箱', interests: '兴趣爱好', contact: '联系我', footer: '页脚', ...extraNames } as const
export type BuiltinSectionType = keyof typeof sectionNames
export type SectionType = BuiltinSectionType | `markdown-${string}`
export type SectionKind = BuiltinSectionType | 'markdown'
export const defaultLayout: BuiltinSectionType[] = ['profile', 'projects', 'writing', 'tools', 'interests', 'contact', 'footer']
export const builtinSections = Object.keys(sectionNames) as BuiltinSectionType[]
export const sectionKind = (id: SectionType): SectionKind => id.startsWith('markdown-') ? 'markdown' : id as BuiltinSectionType
export const sectionLabel = (id: SectionType, config?: SiteConfig): string => sectionKind(id) === 'markdown' ? config?.markdownBlocks?.[id]?.name || 'Markdown' : sectionNames[id as BuiltinSectionType]
export const layoutSchema = z.array(z.union([z.enum(builtinSections as [BuiltinSectionType, ...BuiltinSectionType[]]), z.string().regex(/^markdown-[a-z0-9-]+$/).transform(id => id as `markdown-${string}`)])).max(100).refine(items => new Set(items).size === items.length, '模块实例不能重复')
export const routeSchema = z.string().max(240).regex(/^\/(?:[a-zA-Z0-9_-]+\/)*$/, '路由须为 / 或 /about/、/work/demo/ 格式').refine(route => !/^\/(?:assets|api|__edit|src|node_modules|@vite)(?:\/|$)/i.test(route) && !route.split('/').some(part => /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(part)), '此路由为系统保留路径')
export const pagesSchema = z.object({ version: z.literal(1), pages: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), route: routeSchema, config: configSchema, layout: layoutSchema })).min(1).max(100) }).superRefine((value, ctx) => {
  for (const key of ['route', 'id'] as const) {
    if (new Set(value.pages.map(page => page[key].toLowerCase())).size !== value.pages.length) ctx.addIssue({ code: 'custom', message: `${key} 不能重复`, path: ['pages'] })
  }
  if (!value.pages.some(page => page.route === '/')) ctx.addIssue({ code: 'custom', message: '必须保留一个首页路由 /', path: ['pages'] })
  value.pages.forEach((page, index) => page.layout.forEach(id => {
    if (sectionKind(id) === 'markdown' && !page.config.markdownBlocks[id]) ctx.addIssue({ code: 'custom', message: `找不到 Markdown 模块 ${id}`, path: ['pages', index, 'layout'] })
  }))
})
export type PageDocument = z.infer<typeof pagesSchema>
export const initialPages = (config: SiteConfig): PageDocument => ({ version: 1, pages: [{ id: 'home', route: '/', config, layout: [...defaultLayout] }] })
