import { useState } from 'react'

interface StoryInputProps {
  onDebugPrint: (text: string) => void
}

export default function StoryInput({ onDebugPrint }: StoryInputProps) {
  const [textInput, setTextInput] = useState('')

  const handleDebugClick = () => {
    onDebugPrint(textInput)
  }

  return (
    <div className="card">
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Enter your story prompt here..."
        rows={10}
        cols={50}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={handleDebugClick}>
        Debug Print
      </button>
    </div>
  )
}