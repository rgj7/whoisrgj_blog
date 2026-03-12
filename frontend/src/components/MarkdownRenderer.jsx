import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'
import 'github-markdown-css/github-markdown-dark.css'
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
  return (
    <div className="markdown-body">
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
