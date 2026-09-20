import lucide from '@iconify-json/lucide/icons.json' with { type: 'json' }
import brands from '@iconify-json/simple-icons/icons.json' with { type: 'json' }
import type { IconifyIcon } from '@iconify/vue/offline'

const collections: Record<string, { width?: number; height?: number; icons: Record<string, IconifyIcon> }> = { lucide, 'simple-icons': brands }
export const toolIconNames = Object.entries(collections).flatMap(([prefix, collection]) =>
  Object.keys(collection.icons).map(name => `${prefix}:${name}`))

/** Only trusted, bundled icon data can become inline SVG. No remote SVG input. */
export function getToolIcon(name: string): IconifyIcon | undefined {
  const [prefix, key, extra] = name.split(':')
  const collection = Object.hasOwn(collections, prefix ?? '') ? collections[prefix!] : undefined
  if (extra !== undefined || !collection || !key || !Object.hasOwn(collection.icons, key)) return undefined
  return { width: collection.width ?? 24, height: collection.height ?? 24, ...collection.icons[key]! }
}
