import { expect, test } from '@playwright/test'
import demo from '../../public/site.config.json' with { type: 'json' }

test('完整页面、独立链接、RSS 与响应式布局', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Alex.' })).toBeVisible()
  await expect(page.locator('.article-row')).toHaveCount(3)
  await expect(page.locator('.article-row').first()).toContainText('让个人主页更像你自己')
  await expect(page.getByRole('link', { name: 'Paper Notes · Demo', exact: true })).toHaveAttribute('href', 'https://example.com/projects/notes')
  await expect(page.getByRole('link', { name: 'Paper Notes · GitHub 源码', exact: true })).toHaveAttribute('href', 'https://example.com/github/notes')
  await page.getByRole('link', { name: '查看我的作品', exact: true }).click()
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:hello@example.com')
  for (const selector of ['.toolkit', '.interest-grid', '.footer']) await page.locator(selector).scrollIntoViewIfNeeded()
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(() => page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0))).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(errors).toEqual([])
  await page.screenshot({ path: `test-results/${testInfo.project.name}-full.png`, fullPage: true })
})

test('订阅失败可重试，空订阅有明确状态', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/feed', route => {
    attempts++
    return attempts === 1 ? route.fulfill({ status: 502, json: { error: 'offline' } }) : route.fulfill({ json: { articles: [], fetchedAt: new Date().toISOString(), stale: false } })
  })
  await page.goto('/')
  await expect(page.getByText(demo.labels.feedError)).toBeVisible()
  await page.getByRole('button', { name: demo.labels.retry }).click()
  await expect(page.getByText(demo.labels.emptyFeed)).toBeVisible()
})

test('配置控制内容、隐藏空区块、主题与链接', async ({ page }) => {
  const config = structuredClone(demo)
  config.profile.name = '小一'
  config.projects = []
  config.interests = []
  config.toolGroups = [{ name: '空分类', items: [] }]
  config.blog.enabled = false
  config.now.enabled = false
  config.contact.enabled = false
  config.theme.accent = '#6841CC'
  await page.route('**/site.config.json', route => route.fulfill({ json: config }))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '小一.' })).toBeVisible()
  await expect(page.locator('.projects, .writing, .toolkit, .interests, .contact')).toHaveCount(0)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-accent'))).toBe('#6841CC')
})

test('扩展内容和长标题自然换行', async ({ page }) => {
  const config = structuredClone(demo)
  config.profile.name = '一个很长的个人名字 Long Name'
  config.projects = Array.from({ length: 5 }, (_, index) => ({ ...demo.projects[index % 2]!, name: `作品 ${index} 一个比较长的项目名称`, featured: index === 3, demoUrl: index === 2 ? '' : demo.projects[0]!.demoUrl, githubUrl: '' }))
  config.interests = Array.from({ length: 5 }, (_, index) => ({ ...demo.interests[index % 3]!, name: `兴趣 ${index}` }))
  config.toolGroups = Array.from({ length: 4 }, (_, index) => ({ name: `工具分类 ${index}`, items: [...demo.toolGroups[0]!.items, ...demo.toolGroups[1]!.items] }))
  await page.route('**/site.config.json', route => route.fulfill({ json: config }))
  await page.goto('/')
  await expect(page.locator('.featured-title h3')).toHaveText('作品 3 一个比较长的项目名称')
  await expect(page.locator('.project-row')).toHaveCount(4)
  await expect(page.locator('.interest-grid article')).toHaveCount(5)
  await expect(page.getByText(demo.labels.noProjectLinks)).toBeVisible()
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `width ${width}`).toBe(true)
  }
})
