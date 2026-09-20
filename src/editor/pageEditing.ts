import { inject, watch, type ComputedRef, type Directive, type InjectionKey } from 'vue'
import { sectionLabel, type SectionType } from '../../shared/pages'

export type TextTarget = string | { path: string; separator: string }
export interface PageEditing {
  read(path: string): unknown
  write(path: string, value: unknown): void
  select(section: SectionType): void
  image(path: string): void
  pending(value: boolean): void
  text(path: string, color: string): void
  selected(): string
  markdownEditing(): string
  editMarkdown(id: string): void
}
export const pageEditingKey: InjectionKey<PageEditing> = Symbol('page-editing')
export const textColorsKey: InjectionKey<ComputedRef<Record<string, string>>> = Symbol('text-colors')

/** Opt-in directives: no editor attributes or listeners in public/SSR pages. */
export function usePageEditing(ownColors?: ComputedRef<Record<string, string>>) {
  const editor = inject(pageEditingKey, undefined)
  const colors = ownColors ?? inject(textColorsKey, undefined)
  const targets = new WeakMap<HTMLElement, TextTarget>()
  const elements = new Set<HTMLElement>()
  const sections = new Map<HTMLElement, string>()
  if (editor) watch(() => editor.selected(), value => sections.forEach((id, el) => el.classList.toggle('edit-section-active', id === value)))
  const pathOf = (value: TextTarget) => typeof value === 'string' ? value : value.path
  function colorFor(value: TextTarget) { return colors?.value?.[pathOf(value)] || '' }
  function applyColor(el: HTMLElement) { const target = targets.get(el); if (target) el.style.color = colorFor(target) }
  if (colors) watch(colors, () => elements.forEach(applyColor), { deep: true })
  function select(el: HTMLElement) {
    const section = el.closest<HTMLElement>('[data-edit-section]')?.dataset.editSection as SectionType | undefined
    if (section) editor?.select(section)
  }
  const vEdit: Directive<HTMLElement, TextTarget> = {
    getSSRProps: binding => binding.value && colorFor(binding.value) ? { style: { color: colorFor(binding.value) } } : {},
    mounted(el, binding) {
      if (!binding.value) return
      targets.set(el, binding.value)
      elements.add(el); applyColor(el)
      if (!editor) return
      el.contentEditable = 'plaintext-only'
      el.dataset.editText = pathOf(binding.value)
      el.setAttribute('role', 'textbox')
      el.setAttribute('aria-label', `直接编辑 ${pathOf(binding.value)}`)
      el.setAttribute('spellcheck', 'false')
      let original = ''
      el.addEventListener('focus', () => { original = el.innerText; select(el); editor.text(pathOf(targets.get(el)!), getComputedStyle(el).color) })
      el.addEventListener('input', () => editor.pending(el.innerText !== original))
      el.addEventListener('blur', () => {
        editor.pending(false)
        if (el.innerText === original) return
        const target = targets.get(el)!
        const value = el.innerText.replace(/\r\n/g, '\n').trim()
        editor.write(pathOf(target), typeof target === 'string' ? value : value.split(target.separator))
      })
      el.addEventListener('keydown', event => {
        if (event.isComposing) return
        if (event.key === 'Escape') { el.innerText = original; el.blur(); event.stopPropagation() }
        if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); el.blur() }
      })
    },
    updated(el, binding) {
      if (!binding.value) return
      targets.set(el, binding.value)
      applyColor(el)
      if (!editor) return
      el.dataset.editText = pathOf(binding.value)
      el.setAttribute('aria-label', `直接编辑 ${pathOf(binding.value)}`)
    },
    unmounted(el) { elements.delete(el); targets.delete(el) },
  }
  const vImage: Directive<HTMLElement, string> = {
    getSSRProps: () => ({}),
    mounted(el, binding) {
      if (!editor) return
      el.dataset.editImage = binding.value
      el.tabIndex = 0
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', '替换图片')
      const open = () => { select(el); editor.image(el.dataset.editImage!) }
      el.addEventListener('click', open)
      el.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open() } })
    },
    updated(el, binding) { if (editor) el.dataset.editImage = binding.value },
  }
  const vSection: Directive<HTMLElement, SectionType> = {
    getSSRProps: () => ({}),
    mounted(el, binding) {
      if (!editor) return
      el.dataset.editSection = binding.value
      el.dataset.editLabel = sectionLabel(binding.value)
      sections.set(el, binding.value)
      el.classList.toggle('edit-section-active', editor.selected() === binding.value)
    },
    unmounted(el) { sections.delete(el) },
  }
  return { vEdit, vImage, vSection }
}
