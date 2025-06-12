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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Enter your story prompt here..."
        rows={10}
        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <button 
        onClick={handleDebugClick}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        Debug Print
      </button>
    </div>
  )
}