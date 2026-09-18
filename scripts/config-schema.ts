import { writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { configSchema } from '../shared/config'

await writeFile('public/site.schema.json', JSON.stringify(z.toJSONSchema(configSchema, { io: 'input' }), null, 2))
console.log('配置 JSON Schema 已更新。')
