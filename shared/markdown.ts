import MarkdownIt from 'markdown-it'

// Keep raw HTML as text. The parser also rejects executable URL protocols.
const markdown = new MarkdownIt({ html: false, linkify: true, breaks: false })
export const renderMarkdown = (source: string): string => markdown.render(source)

const footerMarkdown = new MarkdownIt({ html: false, linkify: false, breaks: false })
footerMarkdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
  const token = tokens[index]!
  const href = String(token.attrGet('href') ?? '')
  if (/^(https?:)?\/\//i.test(href)) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }
  return renderer.renderToken(tokens, index, options)
}
export const renderFooter = (source: string): string => footerMarkdown.renderInline(source)
