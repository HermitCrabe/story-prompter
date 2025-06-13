import { useEffect, useRef } from 'react'

interface StreamingResponseProps {
  content: string
  isStreaming: boolean
  error?: string
}

export default function StreamingResponse({ content, isStreaming, error }: StreamingResponseProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content])

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-400 font-medium">Error</h3>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!content && !isStreaming) {
    return null
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-medium">LLM Response</h3>
        {isStreaming && (
          <div className="flex items-center text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent mr-2"></div>
            <span className="text-sm">Streaming...</span>
          </div>
        )}
      </div>
      
      <div 
        ref={contentRef}
        className="p-4 max-h-96 overflow-y-auto"
      >
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-gray-200 font-sans leading-relaxed">
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-blue-400 ml-1 animate-pulse" />
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}