import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useTheme } from '../hooks/useTheme'
import 'github-markdown-css/github-markdown.css'
import darkHljsUrl from 'highlight.js/styles/atom-one-dark.css?url'
import lightHljsUrl from 'highlight.js/styles/github.css?url'
import TerminalBlock from './TerminalBlock'

const mdComponents = {
  code({ className, children, ...props }) {
    const lang = (className || '').match(/\blanguage-(\S+)/)?.[1] || ''
    if (lang === 'terminal') {
      return <TerminalBlock content={String(children)} />
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

export default function MarkdownRenderer({ content }) {
  const { isDark } = useTheme()

  useEffect(() => {
    let el = document.getElementById('hljs-theme')
    if (!el) {
      el = document.createElement('link')
      el.id = 'hljs-theme'
      el.rel = 'stylesheet'
      document.head.appendChild(el)
    }
    el.href = isDark ? darkHljsUrl : lightHljsUrl
  }, [isDark])

  return (
    <div className="markdown-body" data-color-mode={isDark ? 'dark' : 'light'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={mdComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
