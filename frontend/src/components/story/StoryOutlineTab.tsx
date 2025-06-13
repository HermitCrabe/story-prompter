import { useState } from 'react'
import { useLLM } from '../../contexts/LLMContext'
import { customOutlineSchema, type CustomOutlineFormat } from '../../schemas/customOutlineSchema'

interface StoryOutlineTabProps {
  storyId: string
}

export default function StoryOutlineTab({ storyId }: StoryOutlineTabProps) {
  const [storyDescription, setStoryDescription] = useState('')
  const [generatedOutline, setGeneratedOutline] = useState('')
  const [rawJsonOutput, setRawJsonOutput] = useState('')
  const [showRawJson, setShowRawJson] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { prompts, settings, isConfigured, streamLLMResponse } = useLLM()

  // Function to format custom outline data into readable text
  const formatCustomOutline = (outline: CustomOutlineFormat): string => {
    let formatted = `# Story Outline\n\n`
    
    Object.entries(outline).forEach(([chapterName, chapterData]) => {
      formatted += `## ${chapterName}\n`
      formatted += `**Eroticism Level:** ${chapterData.eroticism_level.toUpperCase()}\n\n`
      formatted += `**Actions:**\n`
      chapterData.actions.forEach((action, index) => {
        formatted += `${index + 1}. ${action}\n`
      })
      formatted += `\n`
    })
    
    return formatted
  }

  const handleGenerateOutline = async () => {
    if (!storyDescription.trim()) {
      alert('Please enter a story description first.')
      return
    }

    if (!isConfigured) {
      alert('LLM API is not configured. Please go to Settings to configure your API.')
      return
    }

    setIsGenerating(true)
    setGeneratedOutline('') // Clear previous outline
    setRawJsonOutput('') // Clear previous raw JSON

    // Use the customizable prompt template with story description substitution
    let userPrompt = prompts.outlinePrompt.replace('{STORY_DESCRIPTION}', storyDescription.trim())
    let systemPrompt = 'You are a professional story editor and outline creator. Generate detailed, well-structured story outlines based on user descriptions.'
    
    // If structured output is enabled, modify the prompt and use schema
    const useStructured = settings.useStructuredOutput
    if (useStructured) {
      systemPrompt += ' Provide the outline in a structured JSON format where each chapter/section is a key, and the value contains an array of actions and an eroticism level.'
      userPrompt += '\n\nPlease format your response as a JSON object where:\n- Each key is a chapter or section name\n- Each value has "actions" (array of story actions) and "eroticism_level" ("low", "med", or "high")\n\nExample format:\n```json\n{"Chapter 1 - Introduction": {"actions": ["Character introduction", "Setting established"], "eroticism_level": "low"}}\n```'
    }
    
    try {
      let accumulatedContent = ''
      
      await streamLLMResponse(
        systemPrompt,
        userPrompt,
        (chunk) => {
          accumulatedContent += chunk
          
          if (useStructured) {
            // Store the raw JSON for inspection
            setRawJsonOutput(accumulatedContent)
            
            // For structured output, try to parse and format the JSON as it streams
            try {
              const parsed = JSON.parse(accumulatedContent) as CustomOutlineFormat
              setGeneratedOutline(formatCustomOutline(parsed))
            } catch {
              // Still accumulating, show raw content
              setGeneratedOutline(accumulatedContent)
            }
          } else {
            // For regular output, just append the chunk
            setGeneratedOutline(prev => prev + chunk)
          }
        },
        (error) => {
          setGeneratedOutline(prev => prev + '\n\n[Error: ' + error + ']')
        },
        'Story Outline Generation',
        useStructured ? customOutlineSchema : undefined
      )
    } catch (error) {
      console.error('Failed to generate outline:', error)
      setGeneratedOutline('Failed to generate outline. Please check your LLM configuration and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearOutline = () => {
    setGeneratedOutline('')
    setRawJsonOutput('')
  }

  const handleCopyOutline = () => {
    if (generatedOutline) {
      navigator.clipboard.writeText(generatedOutline)
        .then(() => {
          // Could add a toast notification here
          console.log('Outline copied to clipboard')
        })
        .catch(err => {
          console.error('Failed to copy outline:', err)
        })
    }
  }

  return (
    <div className="space-y-6">
      {/* Story Description Input */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Story Description</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Describe your story concept
            </label>
            <textarea
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
              placeholder="Enter a detailed description of your story idea, including main characters, setting, conflict, and any key plot points you want to include..."
              rows={6}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleGenerateOutline}
              disabled={!storyDescription.trim() || isGenerating || !isConfigured}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Outline
                </>
              )}
            </button>
            
            {!isConfigured && (
              <div className="flex items-center text-yellow-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                LLM not configured
              </div>
            )}
            
            {isConfigured && settings.useStructuredOutput && (
              <div className="flex items-center text-blue-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Structured output enabled
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Outline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Generated Outline</h3>
          {generatedOutline && (
            <div className="flex gap-2">
              {settings.useStructuredOutput && rawJsonOutput && (
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className={`px-3 py-1 text-sm rounded transition-colors duration-200 flex items-center gap-1 ${
                    showRawJson 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  {showRawJson ? 'Show Formatted' : 'Show JSON'}
                </button>
              )}
              <button
                onClick={handleCopyOutline}
                className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              <button
                onClick={handleClearOutline}
                className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          )}
        </div>
        
        <div className="relative">
          <textarea
            value={showRawJson ? rawJsonOutput : generatedOutline}
            onChange={(e) => {
              if (showRawJson) {
                setRawJsonOutput(e.target.value)
              } else {
                setGeneratedOutline(e.target.value)
              }
            }}
            placeholder={isGenerating ? "Generating outline..." : "Generated outline will appear here..."}
            rows={20}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            readOnly={isGenerating}
          />
          
          {isGenerating && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center text-blue-400 text-sm">
                <svg className="w-4 h-4 animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Streaming...
              </div>
            </div>
          )}
        </div>
        
        {generatedOutline && !isGenerating && (
          <div className="mt-2 text-sm text-gray-400">
            You can edit the generated outline above. Changes are automatically saved.
          </div>
        )}
      </div>
    </div>
  )
}