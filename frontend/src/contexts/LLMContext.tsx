import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { LLMService } from '../services/llmService'

interface LLMSettings {
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  useStructuredOutput: boolean
}

interface LLMPrompts {
  outlinePrompt: string
}

interface LLMContextType {
  settings: LLMSettings
  prompts: LLMPrompts
  updateSettings: (newSettings: Partial<LLMSettings>) => void
  updatePrompts: (newPrompts: Partial<LLMPrompts>) => void
  isConfigured: boolean
  streamLLMResponse: (
    systemMessage: string,
    userMessage: string,
    onChunk: (chunk: string) => void,
    onError?: (error: string) => void,
    context?: string,
    jsonSchema?: object
  ) => Promise<void>
}

const defaultSettings: LLMSettings = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  useStructuredOutput: false
}

const defaultPrompts: LLMPrompts = {
  outlinePrompt: `I want you to create a detailed outline for a story that includes all plot points, with both major and minor actions. The outline should be clear and organized with sections and subsections. The primary goal of the outline is to provide an explicit roadmap for the story, and to provide a detailed list of all major and minor actions that will occur in the story. You will use the provided character descriptions to inform the outline. The primary type of story that you will outline is a very erotic story, with the majority of the entire story being focused on a sexual encounter (or multiple sexual encounters). You usually don't write about mushy fluff like romance, unless it is specifically related to the sexual encounter, or specifically requested. As such, when outlining, you will focus on the sexual encounter, the characters' physical appearance, and in particular the characters' sexual organs. The outline will often cover specific sexual acts over the course of the sexual encounter. When coming up with ideas, you will make use of the physical characteristics of the characters to create unique and interesting sexual encounters, emphasizing their characteristics as a part of the 'plot' of the sexual encounter. Each bullet point in the outline should be detailed, up to two or three sentences describing what that section should entail.
  
  The story's outline should follow this prompt from the user:
  "{STORY_DESCRIPTION}"
`
}

const LLMContext = createContext<LLMContextType | undefined>(undefined)

export function LLMProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LLMSettings>(defaultSettings)
  const [prompts, setPrompts] = useState<LLMPrompts>(defaultPrompts)

  useEffect(() => {
    // Load settings
    const savedSettings = localStorage.getItem('llm-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved LLM settings:', error)
      }
    }

    // Load prompts
    const savedPrompts = localStorage.getItem('llm-prompts')
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts)
        setPrompts({ ...defaultPrompts, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved LLM prompts:', error)
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<LLMSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('llm-settings', JSON.stringify(updatedSettings))
  }

  const updatePrompts = (newPrompts: Partial<LLMPrompts>) => {
    const updatedPrompts = { ...prompts, ...newPrompts }
    setPrompts(updatedPrompts)
    localStorage.setItem('llm-prompts', JSON.stringify(updatedPrompts))
  }

  const streamLLMResponse = async (
    systemMessage: string,
    userMessage: string,
    onChunk: (chunk: string) => void,
    onError?: (error: string) => void,
    context?: string,
    jsonSchema?: object
  ) => {
    // Log the exact prompt being sent
    const fullPrompt = {
      context: context || 'Unknown',
      timestamp: new Date().toISOString(),
      settings: {
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        useStructuredOutput: settings.useStructuredOutput
      },
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      jsonSchema: jsonSchema || null
    }
    
    console.group(`🤖 LLM Request - ${context || 'Unknown Context'}`)
    console.log('📝 Full prompt details:', fullPrompt)
    console.log('🔧 System message:', systemMessage)
    console.log('👤 User message:', userMessage)
    console.groupEnd()

    if (!settings.baseUrl || !settings.model) {
      const error = 'LLM API not configured (missing Base URL or Model)'
      console.error('❌ LLM Error:', error)
      onError?.(error)
      return
    }

    try {
      const llmService = new LLMService(settings)
      const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]

      let previousLength = 0
      
      for await (const chunk of llmService.streamCompletion(messages, undefined, jsonSchema)) {
        if (chunk.error) {
          console.error('❌ LLM Stream Error:', chunk.error)
          onError?.(chunk.error)
          break
        }
        
        // Extract only the new content since last chunk
        if (chunk.content.length > previousLength) {
          const newContent = chunk.content.slice(previousLength)
          onChunk(newContent)
          previousLength = chunk.content.length
        }
        
        if (chunk.isComplete) {
          console.log('✅ LLM Response completed')
          break
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ LLM Request failed:', errorMessage)
      onError?.(errorMessage)
    }
  }

  const isConfigured = Boolean(settings.baseUrl && settings.model)

  return (
    <LLMContext.Provider value={{ 
      settings, 
      prompts, 
      updateSettings, 
      updatePrompts, 
      isConfigured,
      streamLLMResponse
    }}>
      {children}
    </LLMContext.Provider>
  )
}

export function useLLM() {
  const context = useContext(LLMContext)
  if (context === undefined) {
    throw new Error('useLLM must be used within a LLMProvider')
  }
  return context
}