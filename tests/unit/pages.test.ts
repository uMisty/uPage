import { describe, expect, it } from 'vitest'
import { configSchema } from '../../shared/config'
import { initialPages, pagesSchema, routeSchema } from '../../shared/pages'
import config from '../../public/site.config.json'
describe('editable pages', () => {
  it('migrates the existing homepage without losing content', () => {
    const document = initialPages(configSchema.parse(config))
    expect(pagesSchema.parse(document).pages[0].config.profile.name).toBe(config.profile.name)
    expect(document.pages[0].layout).toHaveLength(7)
  })
  it.each(['/../', '/assets/', '/api/demo/', '/__edit/', '//other/', '/a.html/', '/中文/', '/about'])('rejects unsafe or ambiguous route %s', route => expect(routeSchema.safeParse(route).success).toBe(false))
  it.each(['/', '/about/', '/work/my-project/'])('accepts static directory route %s', route => expect(routeSchema.safeParse(route).success).toBe(true))
  it('rejects duplicate routes, duplicate blocks and missing homepage', () => {
    const document = initialPages(configSchema.parse(config))
    document.pages.push({ ...document.pages[0], id: 'other' })
    expect(pagesSchema.safeParse(document).success).toBe(false)
    document.pages.pop()
    document.pages[0].layout.push('profile')
    expect(pagesSchema.safeParse(document).success).toBe(false)
    document.pages[0].layout = []
    document.pages[0].route = '/about/'
    expect(pagesSchema.safeParse(document).success).toBe(false)
  })
})
