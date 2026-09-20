import { test, expect } from '@playwright/test'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import sirv from 'sirv'
const require = createRequire(import.meta.url)
test('edit, upload, reorder, persist and export nested static pages', async ({ page, browser, request }) => {
  test.setTimeout(120_000)
  const previous = await readFile('public/pages.json', 'utf8').catch(() => null)
  let uploadPath = ''
  try {
    await page.goto('/__edit/')
    await expect(page.getByRole('button', { name: '保存全部页面' })).toBeEnabled()
    await page.getByRole('textbox', { name: '直接编辑 profile.name', exact: true }).fill('编辑器测试')
    await page.getByRole('textbox', { name: '直接编辑 profile.name', exact: true }).press('Enter')
    await expect(page.locator('.preview-viewport h1')).toContainText('编辑器测试')
    await expect(page.getByLabel('名称', { exact: true })).toHaveValue('编辑器测试')
    await page.locator('[data-edit-image="profile.image"]').click()
    await expect(page.locator('.inspector-heading h2')).toHaveText('替换图片')
    const uploadResponse = page.waitForResponse(response => response.url().endsWith('/__edit/api/upload'))
    await page.locator('input[type=file]').setInputFiles({ name: 'pixel.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') })
    uploadPath = (await (await uploadResponse).json()).url
    await expect(page.locator('.asset-preview')).toHaveAttribute('src', uploadPath)
    await page.getByRole('button', { name: '上移兴趣爱好', exact: true }).click()
    await page.getByRole('button', { name: '联系我', exact: true }).click()
    await page.getByRole('button', { name: '移除当前模块', exact: true }).click()
    await page.getByRole('button', { name: '添加模块', exact: true }).click()
    await page.getByRole('button', { name: '添加联系我', exact: true }).click()
    await page.getByRole('button', { name: '页面', exact: true }).click()
    await page.getByRole('button', { name: '新建页面', exact: true }).click()
    await page.getByLabel('访问路由（例如 /about/）').fill('/work/demo/')
    await page.getByRole('button', { name: '保存全部页面', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('已保存。')
    await page.reload()
    await expect(page.getByRole('combobox', { name: '选择页面' }).locator('option')).toHaveCount(2)
    const forbidden = await request.post('/__edit/api/pages', { data: {} })
    expect(forbidden.status()).toBe(403)
    execFileSync(process.execPath, [resolve(dirname(require.resolve('vite/package.json')), 'bin/vite.js'), 'build'], { stdio: 'pipe' })
    execFileSync(process.execPath, [require.resolve('tsx/cli'), 'scripts/build-static.ts'], { stdio: 'pipe' })
    const html = await readFile('dist/work/demo/index.html', 'utf8')
    expect(html).toContain('编辑器测试')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('/api/feed')
    expect(html).not.toContain('contenteditable')
    expect(html).not.toContain('data-edit-')
    const server = createServer(sirv('dist'))
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address() as { port: number }
    const context = await browser.newContext({ javaScriptEnabled: false })
    try {
      const staticPage = await context.newPage()
      await staticPage.goto(`http://127.0.0.1:${address.port}/work/demo/`)
      await expect(staticPage.locator('h1')).toContainText('编辑器测试')
      await expect(staticPage.locator('.article-row')).toHaveCount(3)
      await staticPage.screenshot({ path: 'test-results/static-page.png', fullPage: true })
    } finally { await context.close(); server.close() }
    await page.screenshot({ path: 'test-results/editor.png', fullPage: true })
  } finally {
    if (previous === null) await unlink('public/pages.json').catch(() => {})
    else await writeFile('public/pages.json', previous)
    if (uploadPath) await unlink(`public${uploadPath}`).catch(() => {})
  }
})
