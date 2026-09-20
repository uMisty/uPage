import { test, expect } from '@playwright/test'
import demo from '../../public/site.config.json' with { type: 'json' }
import { initialPages } from '../../shared/pages'
import { configSchema } from '../../shared/config'

test('tool icons can be searched, selected on canvas, and switched back to images', async ({ page }) => {
  const document = initialPages(configSchema.parse(demo))
  await page.route('**/__edit/api/pages', async route => {
    if (route.request().method() === 'GET') await route.fulfill({ json: document })
    else await route.abort()
  })
  await page.goto('/__edit/')
  const icon = page.locator('[data-edit-image="toolGroups.0.items.0.icon"]')
  await icon.click()
  await page.getByLabel('图标来源').selectOption('library')
  await page.getByLabel('搜索图标').fill('vuedotjs')
  await page.getByRole('button', { name: 'simple-icons:vuedotjs', exact: true }).click()
  await expect(icon.locator('svg')).toBeVisible()
  await expect(page.locator('.icon-current')).toContainText('simple-icons:vuedotjs')
  await page.getByLabel('搜索图标').fill('nonexistent-icon-name')
  await expect(page.getByText('没有匹配的图标，请尝试其他英文名称。')).toBeVisible()
  await page.getByLabel('图标来源').selectOption('image')
  await page.getByLabel('图标', { exact: true }).fill('/assets/upage-icon.svg')
  await expect(icon.locator('img')).toHaveAttribute('src', '/assets/upage-icon.svg')
})
