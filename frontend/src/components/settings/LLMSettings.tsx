import { useState, useEffect, useRef } from 'react'
import { useLLM } from '../../contexts/LLMContext'

interface ModelData {
  id: string
  object: string
  owned_by: string
}

export default function LLMSettings() {
  const { settings, prompts, updateSettings, updatePrompts, isConfigured } = useLLM()
  const [tempSettings, setTempSettings] = useState(settings)
  const [tempPrompts, setTempPrompts] = useState(prompts)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [availableModels, setAvailableModels] = useState<ModelData[]>([])
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  // Check if settings or prompts have been modified
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(tempSettings) || 
                     JSON.stringify(prompts) !== JSON.stringify(tempPrompts)
  
  // Helper function to check if a specific field has been modified
  const isFieldModified = (field: keyof typeof settings) => {
    return settings[field] !== tempSettings[field]
  }

  // Helper function to check if a specific prompt has been modified
  const isPromptModified = (field: keyof typeof prompts) => {
    return prompts[field] !== tempPrompts[field]
  }

  // Helper function to get input classes based on modification state
  const getInputClasses = (field: keyof typeof settings, baseClasses: string) => {
    const modifiedClasses = isFieldModified(field) 
      ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500/50' 
      : 'bg-gray-700 border-gray-600'
    return `${baseClasses} ${modifiedClasses}`
  }

  // Helper function to get prompt input classes based on modification state
  const getPromptInputClasses = (field: keyof typeof prompts, baseClasses: string) => {
    const modifiedClasses = isPromptModified(field) 
      ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500/50' 
      : 'bg-gray-700 border-gray-600'
    return `${baseClasses} ${modifiedClasses}`
  }

  useEffect(() => {
    setTempSettings(settings)
  }, [settings])

  useEffect(() => {
    setTempPrompts(prompts)
  }, [prompts])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = () => {
    updateSettings(tempSettings)
    updatePrompts(tempPrompts)
    setTestResult(null) // Clear test result when saving
  }

  const fetchModels = async () => {
    if (isFetchingModels || !tempSettings.baseUrl) return
    
    setIsFetchingModels(true)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Only add Authorization header if API key is provided
      if (tempSettings.apiKey.trim()) {
        headers['Authorization'] = `Bearer ${tempSettings.apiKey}`
      }
      
      const response = await fetch(`${tempSettings.baseUrl}/models`, {
        method: 'GET',
        headers,
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.data && Array.isArray(data.data)) {
          setAvailableModels(data.data)
          setShowModelDropdown(true)
        }
      } else {
        console.error('Failed to fetch models:', response.status)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setIsFetchingModels(false)
    }
  }

  const selectModel = (modelId: string) => {
    setTempSettings(prev => ({ ...prev, model: modelId }))
    setShowModelDropdown(false)
  }

  const handleTest = async () => {
    if (isTesting) return
    
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Only add Authorization header if API key is provided
      if (tempSettings.apiKey.trim()) {
        headers['Authorization'] = `Bearer ${tempSettings.apiKey}`
      }

      // First, fetch available models to validate the selected model
      let modelValidationMessage = ''
      let isModelValid = true
      try {
        const modelsResponse = await fetch(`${tempSettings.baseUrl}/models`, {
          method: 'GET',
          headers,
        })
        
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json()
          if (modelsData.data && Array.isArray(modelsData.data)) {
            const availableModelIds = modelsData.data.map((model: ModelData) => model.id)
            if (!availableModelIds.includes(tempSettings.model)) {
              modelValidationMessage = ` Model "${tempSettings.model}" not found in available models.`
              isModelValid = false
            } else {
              modelValidationMessage = ` Model validated.`
            }
            // Update the available models list if we fetched them
            setAvailableModels(modelsData.data)
          }
        }
      } catch (modelError) {
        modelValidationMessage = ' Could not validate model - models endpoint unavailable.'
      }
      
      // Test the chat completions endpoint
      const response = await fetch(`${tempSettings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: tempSettings.model,
          messages: [{ role: 'user', content: 'Hello, can you respond briefly?' }],
          max_tokens: 50,
          stream: false
        })
      })
      
      if (response.ok) {
        // If model is invalid, show as error even if connection succeeded
        if (!isModelValid) {
          setTestResult({ type: 'error', message: `Connection successful, but${modelValidationMessage}` })
        } else {
          setTestResult({ type: 'success', message: `Connection successful!${modelValidationMessage}` })
        }
      } else {
        const error = await response.text()
        setTestResult({ type: 'error', message: `${response.status}: ${error}${modelValidationMessage}` })
      }
    } catch (error) {
      setTestResult({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {/* Base URL */}
        <div className="flex items-center gap-4">
          <div className="w-24 flex-shrink-0">
            <label 
              className="text-sm font-medium text-gray-200 cursor-help"
              title="OpenAI-compatible API endpoint (e.g., OpenAI, Azure OpenAI, local LLMs)"
            >
              Base URL
            </label>
          </div>
          <input
            type="url"
            value={tempSettings.baseUrl}
            onChange={(e) => setTempSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://api.openai.com/v1"
            title="OpenAI-compatible API endpoint"
            className={getInputClasses('baseUrl', 'flex-1 p-2 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent')}
          />
        </div>

        {/* API Key */}
        <div className="flex items-center gap-4">
          <div className="w-24 flex-shrink-0">
            <label 
              className="text-sm font-medium text-gray-200 cursor-help"
              title="API key (optional, stored locally in browser). Required for most providers."
            >
              API Key
              <span className="text-gray-400 text-xs ml-1">(optional)</span>
            </label>
          </div>
          <input
            type="password"
            value={tempSettings.apiKey}
            onChange={(e) => setTempSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="sk-... (optional)"
            title="API key (optional, stored locally in browser). Required for most providers."
            className={getInputClasses('apiKey', 'flex-1 p-2 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent')}
          />
        </div>

        {/* Model */}
        <div className="flex items-center gap-4">
          <div className="w-24 flex-shrink-0">
            <label 
              className="text-sm font-medium text-gray-200 cursor-help"
              title="Model name/ID to use for completions"
            >
              Model
            </label>
          </div>
          <div className="flex-1 relative" ref={modelDropdownRef}>
            <div className="flex">
              <input
                type="text"
                value={tempSettings.model}
                onChange={(e) => setTempSettings(prev => ({ ...prev, model: e.target.value }))}
                placeholder="gpt-3.5-turbo"
                title="Model name/ID to use for completions"
                className={getInputClasses('model', 'flex-1 p-2 border rounded-l text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent')}
              />
              <button
                onClick={fetchModels}
                disabled={!tempSettings.baseUrl || isFetchingModels}
                title="Fetch available models from API"
                className={`px-3 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed border border-l-0 rounded-r text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isFieldModified('model') 
                    ? 'bg-blue-800 border-blue-500' 
                    : 'bg-gray-600 border-gray-600'
                }`}
              >
                {isFetchingModels ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Models Dropdown */}
            {showModelDropdown && availableModels.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {availableModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => selectModel(model.id)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {model.id}
                  </button>
                ))}
                <div className="border-t border-gray-600 p-2">
                  <button
                    onClick={() => setShowModelDropdown(false)}
                    className="w-full text-center text-xs text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-center gap-4">
          <div className="w-24 flex-shrink-0">
            <label 
              className="text-sm font-medium text-gray-200 cursor-help"
              title="Controls randomness: 0 = focused, 1 = balanced, 2 = creative"
            >
              Temperature
            </label>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={tempSettings.temperature}
              onChange={(e) => setTempSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              title="Controls randomness in responses"
              className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
                isFieldModified('temperature') 
                  ? 'bg-blue-900/50' 
                  : 'bg-gray-700'
              }`}
            />
            <span className="text-sm text-gray-300 w-8 text-right">{tempSettings.temperature}</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="flex items-center gap-4">
          <div className="w-24 flex-shrink-0">
            <label 
              className="text-sm font-medium text-gray-200 cursor-help"
              title="Maximum response length (1-4000 tokens)"
            >
              Max Tokens
            </label>
          </div>
          <input
            type="number"
            min="1"
            max="4000"
            value={tempSettings.maxTokens}
            onChange={(e) => setTempSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1000 }))}
            title="Maximum response length (1-4000 tokens)"
            className={getInputClasses('maxTokens', 'flex-1 p-2 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent')}
          />
        </div>

        {/* Structured Output */}
        <div className="flex items-center gap-4">
          <div className="w-24 flex-shrink-0">
            <label 
              className="text-sm font-medium text-gray-200 cursor-help"
              title="Enable structured JSON outputs with schema validation (OpenAI API compatible models only)"
            >
              Structured Output
            </label>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <button
              onClick={() => setTempSettings(prev => ({ ...prev, useStructuredOutput: !prev.useStructuredOutput }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                tempSettings.useStructuredOutput ? 'bg-blue-600' : 'bg-gray-600'
              } ${isFieldModified('useStructuredOutput') ? 'ring-1 ring-blue-500/50' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tempSettings.useStructuredOutput ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-300">
              {tempSettings.useStructuredOutput ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`mt-4 p-3 rounded-lg border ${
          testResult.type === 'success' 
            ? 'bg-green-900/20 border-green-700' 
            : 'bg-red-900/20 border-red-700'
        }`}>
          <div className="flex items-start">
            {testResult.type === 'success' ? (
              <svg className="w-4 h-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className={`text-sm ${testResult.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {testResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Prompts Section */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Prompt Templates</h3>
        
        {/* Outline Prompt */}
        <div className="space-y-3">
          <div>
            <label 
              className="block text-sm font-medium text-gray-200 mb-2 cursor-help"
              title="Template for generating story outlines. Use {STORY_DESCRIPTION} as a placeholder for the user's story description."
            >
              Story Outline Prompt
            </label>
            <textarea
              value={tempPrompts.outlinePrompt}
              onChange={(e) => setTempPrompts(prev => ({ ...prev, outlinePrompt: e.target.value }))}
              placeholder="Enter the prompt template for generating story outlines..."
              rows={8}
              className={getPromptInputClasses('outlinePrompt', 'w-full p-3 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm font-mono')}
            />
            <p className="text-xs text-gray-400 mt-1">
              Use <code className="bg-gray-800 px-1 rounded">{"{STORY_DESCRIPTION}"}</code> as a placeholder for the user's story description.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={!tempSettings.baseUrl || isTesting}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center"
          >
            {isTesting && (
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
            )}
            {isTesting ? 'Testing...' : 'Test'}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-3 py-1.5 text-white text-sm rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}