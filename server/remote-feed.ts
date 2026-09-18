import { lookup } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import ipaddr from 'ipaddr.js'

const MAX_BYTES = 2 * 1024 * 1024

export function isPublicAddress(address: string): boolean {
  try { return ipaddr.process(address).range() === 'unicast' } catch { return false }
}

/** Pin the verified DNS address to the request; revalidate each redirect. */
export async function fetchRemoteFeed(address: string, redirects = 0, deadline = Date.now() + 10_000): Promise<string> {
  const url = new URL(address)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('订阅地址无效')
  const remaining = deadline - Date.now()
  if (remaining <= 0) throw new Error('订阅请求超时')
  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = await Promise.race([
    lookup(hostname, { all: true }),
    new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error('DNS 请求超时')), remaining); timer.unref() }),
  ])
  if (!addresses.length || addresses.some(item => !isPublicAddress(item.address))) throw new Error('订阅不能指向本地或私有网络')
  if (Date.now() >= deadline) throw new Error('订阅请求超时')
  const selected = addresses[0]!
  return new Promise((resolve, reject) => {
    const request = (url.protocol === 'https:' ? https : http).get(url, {
      agent: false,
      headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml', 'User-Agent': 'uPage/1.0 RSS Reader', 'Accept-Encoding': 'identity' },
      lookup: ((_host: string, options: any, callback: any) => options?.all ? callback(null, [selected]) : callback(null, selected.address, selected.family)) as any,
    }, response => {
      const status = response.statusCode ?? 500
      if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
        response.resume()
        if (redirects >= 3) return reject(new Error('订阅重定向过多'))
        try { resolve(fetchRemoteFeed(new URL(response.headers.location, url).href, redirects + 1, deadline)) } catch (error) { reject(error) }
        return
      }
      if (status < 200 || status >= 300) { response.resume(); reject(new Error(`订阅返回 HTTP ${status}`)); return }
      const chunks: Buffer[] = []
      let bytes = 0
      response.on('data', (chunk: Buffer) => {
        bytes += chunk.length
        if (bytes > MAX_BYTES) { request.destroy(new Error('订阅内容超过 2 MB')); return }
        chunks.push(chunk)
      })
      response.on('error', reject)
      response.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks)
          const declared = buffer.subarray(0, 200).toString('ascii').match(/encoding=["']([^"']+)["']/i)?.[1]
          resolve(new TextDecoder(declared ?? 'utf-8').decode(buffer))
        } catch { reject(new Error('订阅字符编码不受支持')) }
      })
    })
    const timer = setTimeout(() => request.destroy(new Error('订阅请求超时')), Math.max(1, deadline - Date.now()))
    request.on('close', () => clearTimeout(timer))
    request.on('error', reject)
  })
}
