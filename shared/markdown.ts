import MarkdownIt from 'markdown-it'

// Keep raw HTML as text. The parser also rejects executable URL protocols.
const markdown = new MarkdownIt({ html: false, linkify: true, breaks: false })
export const renderMarkdown = (source: string): string => markdown.render(source)
