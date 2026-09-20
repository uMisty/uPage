import { z } from 'zod'

const text = z.string().trim()
const link = text.refine(value => !value || /^(\/(?!\/)|#)/.test(value) || (() => { try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } })(), '使用站内路径、锚点或 HTTP(S) 地址')
const image = text.refine(value => !value || /^(https?:\/\/|\/(?!\/))/.test(value), '图片使用站内绝对路径或 HTTP(S) 地址')
const heading = { eyebrow: text, title: text, description: text }
const timeline = z.object({ ...heading, items: z.array(z.object({ period: text, title: text, organization: text, description: text, url: link })) })
const articles = z.object({ ...heading, items: z.array(z.object({ title: text, date: text, category: text, description: text, url: link })) })
const gallery = z.object({ ...heading, items: z.array(z.object({ title: text, description: text, image, imageAlt: text, url: link })) })
const links = z.object({ ...heading, items: z.array(z.object({ name: text, description: text, icon: image, url: link })) })
const faq = z.object({ ...heading, items: z.array(z.object({ question: text, answer: text })) })

export const extraDefaults = {
  timeline: { eyebrow: 'THE JOURNEY', title: '一路走来。', description: '记录工作、学习与重要转折。以下是可替换的示例条目。', items: [{ period: '2026 — 至今', title: '新的开始', organization: '团队 / 学校 / 独立创作', description: '在这里介绍你的角色、经历和收获。', url: '' }, { period: '2025', title: '一个值得纪念的时刻', organization: '个人里程碑', description: '记录一段学习经历，或一个完成的目标。', url: '' }] },
  articles: { eyebrow: 'SELECTED WRITING', title: '值得慢慢读。', description: '手动挑选文章、笔记或系列内容，可链接到站内页面。', items: [{ title: '从这里开始了解我', date: '2026-01-01', category: '置顶 · 示例', description: '替换为文章摘要，并设置对应的访问地址。', url: '' }, { title: '最近的一点思考', date: '', category: '随笔 · 示例', description: '把值得留下的想法，整理成文字。', url: '' }] },
  gallery: { eyebrow: 'LIFE IN FRAMES', title: '收集一些瞬间。', description: '照片、插画与生活切片。', items: [{ title: '创作的日常', description: '替换为你的摄影或插画作品。', image: '/assets/hero-creative-workspace.svg', imageAlt: '创作工作台插画', url: '' }, { title: '另一个视角', description: '为这一刻写一句注释。', image: '', imageAlt: '', url: '' }] },
  links: { eyebrow: 'AROUND THE WEB', title: '互联网的好邻居。', description: '收藏喜欢的博客、朋友与常去的网站。', items: [{ name: '一个喜欢的博客', description: '介绍这个网站值得阅读的理由。', icon: '', url: '' }, { name: '一位创作者', description: '在这里推荐朋友或灵感来源。', icon: '', url: '' }] },
  faq: { eyebrow: 'GOOD TO KNOW', title: '你可能想知道。', description: '提前回答关于合作、联系或内容使用的问题。', items: [{ question: '如何联系我？', answer: '请在这里填写你偏好的联系方式与回复时间。' }, { question: '可以转载这里的内容吗？', answer: '请在这里说明你的转载与署名要求。' }] },
}
export const extraSchemas = {
  timeline: timeline.default(() => structuredClone(extraDefaults.timeline)), articles: articles.default(() => structuredClone(extraDefaults.articles)),
  gallery: gallery.default(() => structuredClone(extraDefaults.gallery)), links: links.default(() => structuredClone(extraDefaults.links)), faq: faq.default(() => structuredClone(extraDefaults.faq)),
}
export const extraNames = { timeline: '经历时间线', articles: '精选文章', gallery: '相册画廊', links: '友链收藏', faq: '常见问题' } as const
export type ExtraSection = keyof typeof extraNames
