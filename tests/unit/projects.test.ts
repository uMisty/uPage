import { describe, expect, it } from 'vitest'
import { projectSchema, releaseTime, selectFeatured } from '../../shared/config'

const project = (releasedAt = '', featured = false) => projectSchema.parse({ name: 'Project', description: '', releasedAt, featured })
describe('主推项目选择', () => {
  it('空项目、单项目和未设置日期', () => {
    expect(selectFeatured([])).toBe(-1)
    expect(selectFeatured([project()])).toBe(0)
    expect(selectFeatured([project(), project()])).toBe(0)
  })
  it('主推标记优先于日期，多个主推项取最新', () => {
    expect(selectFeatured([project('2026-09-18'), project('2025-01-01', true)])).toBe(1)
    expect(selectFeatured([project('2025-01-01', true), project('2026-01-01', true)])).toBe(1)
  })
  it('无标记时选最新，日期相同保持顺序，拒绝溢出的日期', () => {
    expect(selectFeatured([project('2026-01-01'), project('2026-09-18'), project('2026-09-18')])).toBe(1)
    expect(releaseTime(project('2026-02-30'))).toBe(-Infinity)
    expect(selectFeatured([project('2026-02-30'), project('2026-02-28')])).toBe(1)
  })
  it('拒绝危险链接且允许单链接或无链接项目', () => {
    expect(() => projectSchema.parse({ name: 'Unsafe', description: '', demoUrl: 'javascript:alert(1)' })).toThrow()
    expect(project().demoUrl).toBe('')
    expect(projectSchema.parse({ name: 'Source', description: '', githubUrl: 'https://github.com/vuejs/core' }).demoUrl).toBe('')
  })
})
