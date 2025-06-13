interface LLMSettings {
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

export interface StreamingResponse {
  content: string
  isComplete: boolean
  error?: string
}

export class LLMService {
  private settings: LLMSettings

  constructor(settings: LLMSettings) {
    this.settings = settings
  }

  async *streamCompletion(
    messages: Array<{ role: string; content: string }>,
    onChunk?: (chunk: StreamingResponse) => void
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    if (!this.settings.apiKey || !this.settings.baseUrl) {
      yield { content: '', isComplete: true, error: 'LLM API not configured' }
      return
    }

    try {
      const response = await fetch(`${this.settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages,
          temperature: this.settings.temperature,
          max_tokens: this.settings.maxTokens,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        yield { 
          content: '', 
          isComplete: true, 
          error: `API Error: ${response.status} - ${errorText}` 
        }
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        yield { content: '', isComplete: true, error: 'No response body' }
        return
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          const finalChunk = { content: fullContent, isComplete: true }
          if (onChunk) onChunk(finalChunk)
          yield finalChunk
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              const finalChunk = { content: fullContent, isComplete: true }
              if (onChunk) onChunk(finalChunk)
              yield finalChunk
              return
            }

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              
              if (delta) {
                fullContent += delta
                const streamChunk = { content: fullContent, isComplete: false }
                if (onChunk) onChunk(streamChunk)
                yield streamChunk
              }
            } catch (e) {
              // Skip invalid JSON chunks
              continue
            }
          }
        }
      }
    } catch (error) {
      yield { 
        content: '', 
        isComplete: true, 
        error: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  async simpleCompletion(prompt: string): Promise<string> {
    const messages = [{ role: 'user', content: prompt }]
    
    for await (const chunk of this.streamCompletion(messages)) {
      if (chunk.isComplete) {
        if (chunk.error) {
          throw new Error(chunk.error)
        }
        return chunk.content
      }
    }
    
    return ''
  }
}