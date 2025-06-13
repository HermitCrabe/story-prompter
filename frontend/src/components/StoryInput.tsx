import { useState } from 'react'
import { useLLM } from '../contexts/LLMContext'
import { LLMService } from '../services/llmService'
import StreamingResponse from './ui/StreamingResponse'

interface StoryInputProps {
  onDebugPrint: (text: string) => void
}

export default function StoryInput({ onDebugPrint }: StoryInputProps) {
  const [textInput, setTextInput] = useState('')
  const [response, setResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const { settings, isConfigured } = useLLM()

  const handleDebugClick = () => {
    onDebugPrint(textInput)
  }

  const handleGenerateStory = async () => {
    if (!textInput.trim()) {
      setError('Please enter a story prompt')
      return
    }

    if (!isConfigured) {
      setError('LLM API not configured. Please configure it in Settings.')
      return
    }

    setIsStreaming(true)
    setError(undefined)
    setResponse('')

    try {
      const llmService = new LLMService(settings)
      const messages = [
        { 
          role: 'system', 
          content: 'You are a creative storyteller. Generate engaging stories based on the user\'s prompt. Be descriptive and imaginative.' 
        },
        { 
          role: 'user', 
          content: textInput 
        }
      ]

      for await (const chunk of llmService.streamCompletion(messages)) {
        if (chunk.error) {
          setError(chunk.error)
          break
        }
        setResponse(chunk.content)
        if (chunk.isComplete) {
          break
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter your story prompt here..."
          rows={10}
          className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button 
            onClick={handleGenerateStory}
            disabled={isStreaming || !textInput.trim()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {isStreaming ? 'Generating...' : 'Generate Story'}
          </button>
          <button 
            onClick={handleDebugClick}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Debug Print
          </button>
        </div>
      </div>

      <StreamingResponse 
        content={response}
        isStreaming={isStreaming}
        error={error}
      />
    </div>
  )
}