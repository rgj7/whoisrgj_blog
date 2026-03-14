export default function TerminalBlock({ content }) {
  const rawLines = content.replace(/\n$/, '').split('\n')

  let prompt = '$'
  let lines = rawLines
  const promptMatch = rawLines[0]?.match(/^#prompt (.+)/)
  if (promptMatch) {
    prompt = promptMatch[1]
    lines = rawLines.slice(1)
  }

  return (
    <div className="rounded-md font-mono text-base overflow-x-auto">
      {lines.map((line, i) => {
        if (line.startsWith('$ ')) {
          const command = line.slice(2)
          return (
            <div key={i}>
              <span className="text-green-400 select-none">{prompt} </span>
              <span className="text-stone-900 dark:text-white">{command}</span>
            </div>
          )
        }
        if (line === '') {
          return <div key={i} className="h-3" />
        }
        return (
          <div key={i} className="text-gray-400">
            {line}
          </div>
        )
      })}
    </div>
  )
}
