import { expect, test } from '@playwright/test'
import demo from '../../public/site.config.json' with { type: 'json' }
import { configSchema } from '../../shared/config'
import { initialPages, type PageDocument } from '../../shared/pages'

test('canvas text supports commit, cancel, composition and safe plain text saving', async ({ page }) => {
  let saved: PageDocument | undefined
  const initial = initialPages(configSchema.parse(demo))
  await page.route('**/__edit/api/pages', async route => {
    if (route.request().method() === 'POST') { saved = route.request().postDataJSON(); await route.fulfill({ json: { ok: true } }) }
    else await route.fulfill({ json: saved ?? initial })
  })
  await page.goto('/__edit/')
  const name = page.getByRole('textbox', { name: '直接编辑 profile.name', exact: true })
  await name.fill('未提交的修改')
  await expect(page.locator('.save-state')).toContainText('未保存')
  await name.press('Escape')
  await expect(name).toHaveText(demo.profile.name)
  await expect(page.locator('.save-state')).toContainText('已保存')
  await name.fill('中文输入测试')
  await name.dispatchEvent('keydown', { key: 'Enter', isComposing: true })
  await expect(name).toBeFocused()
  await name.press('Enter')
  await expect(page.getByLabel('名称', { exact: true })).toHaveValue('中文输入测试')
  await name.fill('<img src=x onerror=alert(1)>')
  await page.keyboard.press('Control+s')
  await expect(page.getByRole('status')).toContainText('已保存。')
  expect(saved!.pages[0].config.profile.name).toBe('<img src=x onerror=alert(1)>')
  await expect(name.locator('img')).toHaveCount(0)
  await page.reload()
  await expect(name).toHaveText('<img src=x onerror=alert(1)>')
  await page.locator('[data-edit-text="sections.interests.title"]').click()
  await expect(page.locator('.block-row.active')).toContainText('兴趣爱好')
  await expect(page.locator('.inspector-heading h2')).toHaveText('兴趣爱好')
  await page.locator('[data-edit-image="interests.0.image"]').click()
  await expect(page.locator('.inspector-heading h2')).toHaveText('替换图片')
  await page.locator('.inspector-content textarea').first().fill('/assets/hero-creative-workspace.svg')
  await expect(page.locator('[data-edit-image="interests.0.image"]')).toHaveAttribute('src', '/assets/hero-creative-workspace.svg')
})

test('layer drag ordering, searchable insertion and responsive editor', async ({ page }) => {
  await page.route('**/__edit/api/pages', route => route.fulfill({ json: initialPages(configSchema.parse(demo)) }))
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/__edit/')
  await page.getByRole('button', { name: '拖动兴趣爱好', exact: true }).dragTo(page.locator('.block-row').filter({ has: page.getByRole('button', { name: '作品项目', exact: true }) }))
  await expect(page.locator('.block-row').nth(1)).toContainText('兴趣爱好')
  await expect(page.locator('[data-edit-section]').nth(1)).toHaveAttribute('data-edit-section', 'interests')
  await page.getByRole('button', { name: '联系我', exact: true }).click()
  await page.getByRole('button', { name: '移除当前模块' }).click()
  await page.getByRole('button', { name: '添加模块', exact: true }).click()
  await page.getByRole('textbox', { name: '搜索模块' }).fill('联系')
  await expect(page.locator('.insert-card')).toHaveCount(1)
  await page.getByRole('button', { name: '添加联系我', exact: true }).click()
  await expect(page.locator('.block-row').last()).toContainText('联系我')
  await page.getByRole('button', { name: '个人介绍', exact: true }).click()
  await page.screenshot({ path: 'test-results/editor-desktop.png' })
  await page.getByRole('button', { name: '窄屏画布' }).click()
  await expect(page.locator('.preview-viewport')).toHaveClass(/narrow/)
  for (const width of [1280, 780, 390]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.screenshot({ path: 'test-results/editor-mobile.png', fullPage: true })
})
