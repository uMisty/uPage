import { test, expect } from '@playwright/test'
import demo from '../../public/site.config.json' with { type: 'json' }
import { configSchema } from '../../shared/config'
import { initialPages, pagesSchema } from '../../shared/pages'
import { extraNames } from '../../shared/extra-sections'

test('new personal-site modules can be added, edited, reordered and saved', async ({ page }) => {
  let document = initialPages(configSchema.parse(demo))
  document.pages[0].layout = []
  await page.route('**/__edit/api/pages', async route => {
    if (route.request().method() === 'POST') { document = pagesSchema.parse(route.request().postDataJSON()); await route.fulfill({ json: { ok: true } }) }
    else await route.fulfill({ json: document })
  })
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/__edit/')
  for (const [key, name] of Object.entries(extraNames)) {
    await page.getByRole('button', { name: '添加', exact: true }).click()
    await page.getByRole('button', { name: `添加${name}`, exact: true }).click()
    await expect(page.locator(`[data-edit-section="${key}"]`)).toHaveCount(1)
  }
  await page.locator('.faq-list summary').first().click()
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '')
  await page.locator('[data-edit-text="faq.items.0.answer"]').fill('欢迎通过邮件联系我。')
  await page.locator('[data-edit-text="faq.items.0.answer"]').press('Enter')
  await page.getByRole('button', { name: '经历时间线', exact: true }).click()
  await page.locator('[data-edit-text="timeline.items.0.title"]').fill('我的新旅程')
  await page.locator('[data-edit-text="timeline.items.0.title"]').press('Enter')
  await page.getByRole('button', { name: '精选文章', exact: true }).click()
  await page.getByLabel('链接', { exact: true }).first().fill('/blog/hello/')
  await expect(page.locator('.curated-title').first()).toHaveAttribute('href', '/blog/hello/')
  await page.getByRole('button', { name: '相册画廊', exact: true }).click()
  await page.locator('[data-edit-image="gallery.items.0.image"]').click()
  await expect(page.locator('.inspector-heading h2')).toHaveText('替换图片')
  await page.getByRole('button', { name: '友链收藏', exact: true }).click()
  const removeItems = page.getByRole('button', { name: '删除条目', exact: true })
  await removeItems.first().click(); await removeItems.first().click()
  await page.getByRole('button', { name: '＋ 添加条目', exact: true }).click()
  await expect(page.locator('.blogroll-grid article')).toHaveCount(1)
  await page.getByRole('button', { name: '上移当前模块', exact: true }).click()
  await page.getByRole('button', { name: '保存全部页面', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('已保存。')
  expect(document.pages[0].config.timeline.items[0].title).toBe('我的新旅程')
  expect(document.pages[0].config.faq.items[0].answer).toBe('欢迎通过邮件联系我。')
  await page.reload()
  await expect(page.locator('.extra-section')).toHaveCount(5)
  await expect(page.locator('[data-edit-text="timeline.items.0.title"]')).toHaveText('我的新旅程')
  await page.getByRole('button', { name: '经历时间线', exact: true }).click()
  await page.screenshot({ path: 'test-results/new-sections-desktop.png' })
  await page.getByRole('button', { name: '窄屏画布', exact: true }).click()
  expect(await page.locator('.preview-viewport').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
  await page.getByRole('button', { name: '相册画廊', exact: true }).click()
  await page.locator('.extra-gallery').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/new-sections-narrow.png' })
})

test('new and existing modules fit together in the narrow canvas', async ({ page }) => {
  const document = initialPages(configSchema.parse(demo))
  document.pages[0].layout.push('timeline', 'articles', 'gallery', 'links', 'faq')
  await page.route('**/__edit/api/pages', route => route.fulfill({ json: document }))
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/__edit/')
  await page.getByRole('button', { name: '窄屏画布', exact: true }).click()
  expect(await page.locator('.preview-viewport').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
})
