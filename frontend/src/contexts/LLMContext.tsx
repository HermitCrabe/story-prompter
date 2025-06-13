import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface LLMSettings {
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

interface LLMContextType {
  settings: LLMSettings
  updateSettings: (newSettings: Partial<LLMSettings>) => void
  isConfigured: boolean
}

const defaultSettings: LLMSettings = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000
}

const LLMContext = createContext<LLMContextType | undefined>(undefined)

export function LLMProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LLMSettings>(defaultSettings)

  useEffect(() => {
    const savedSettings = localStorage.getItem('llm-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved LLM settings:', error)
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<LLMSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('llm-settings', JSON.stringify(updatedSettings))
  }

  const isConfigured = Boolean(settings.baseUrl)

  return (
    <LLMContext.Provider value={{ settings, updateSettings, isConfigured }}>
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