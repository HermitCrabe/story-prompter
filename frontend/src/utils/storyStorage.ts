interface StoryMetadata {
  id: string
  title: string
  description: string
  characters: string[] // Character IDs
  stages: {
    outlineWritten: boolean
    percentageWritten: number // 0-100
  }
  createdAt: string
  lastModified: string
}

interface StoryData extends StoryMetadata {
  // Future: additional story content like chapters, notes, etc.
}

const STORIES_KEY = 'story-prompter-stories'

// Get all stories from localStorage
export function getAllStories(): StoryData[] {
  try {
    const storiesData = localStorage.getItem(STORIES_KEY)
    if (!storiesData) return []
    
    const stories = JSON.parse(storiesData)
    return Array.isArray(stories) ? stories : []
  } catch (error) {
    console.error('Failed to load stories from localStorage:', error)
    return []
  }
}

// Get a specific story by ID
export function getStoryById(id: string): StoryData | null {
  const stories = getAllStories()
  return stories.find(story => story.id === id) || null
}

// Save a story (create or update)
export function saveStory(storyData: Partial<StoryData>): StoryData {
  const stories = getAllStories()
  const now = new Date().toISOString()
  
  // Find existing story or create new one
  const existingIndex = stories.findIndex(s => s.id === storyData.id)
  
  let story: StoryData
  if (existingIndex >= 0) {
    // Update existing story
    story = {
      ...stories[existingIndex],
      ...storyData,
      lastModified: now
    } as StoryData
    stories[existingIndex] = story
  } else {
    // Create new story
    story = {
      id: storyData.id || generateStoryId(),
      title: storyData.title || 'Untitled Story',
      description: storyData.description || '',
      characters: storyData.characters || [],
      stages: {
        outlineWritten: false,
        percentageWritten: 0,
        ...storyData.stages
      },
      createdAt: now,
      lastModified: now,
      ...storyData
    } as StoryData
    stories.push(story)
  }
  
  // Save to localStorage
  try {
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories))
  } catch (error) {
    console.error('Failed to save story to localStorage:', error)
    throw new Error('Failed to save story')
  }
  
  return story
}

// Delete a story
export function deleteStory(id: string): boolean {
  try {
    const stories = getAllStories()
    const filteredStories = stories.filter(story => story.id !== id)
    
    if (filteredStories.length === stories.length) {
      return false // Story not found
    }
    
    localStorage.setItem(STORIES_KEY, JSON.stringify(filteredStories))
    return true
  } catch (error) {
    console.error('Failed to delete story:', error)
    return false
  }
}

// Update story stages
export function updateStoryStages(id: string, stages: Partial<StoryMetadata['stages']>): boolean {
  const story = getStoryById(id)
  if (!story) return false
  
  try {
    const updatedStory = {
      ...story,
      stages: {
        ...story.stages,
        ...stages
      },
      lastModified: new Date().toISOString()
    }
    
    saveStory(updatedStory)
    return true
  } catch (error) {
    console.error('Failed to update story stages:', error)
    return false
  }
}

// Update story characters
export function updateStoryCharacters(id: string, characters: string[]): boolean {
  const story = getStoryById(id)
  if (!story) return false
  
  try {
    const updatedStory = {
      ...story,
      characters,
      lastModified: new Date().toISOString()
    }
    
    saveStory(updatedStory)
    return true
  } catch (error) {
    console.error('Failed to update story characters:', error)
    return false
  }
}

// Generate a unique story ID
function generateStoryId(): string {
  return `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Export story to JSON file
export function exportStoryToFile(story: StoryData): void {
  const dataStr = JSON.stringify(story, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(link.href)
}

// Import story from JSON file
export function importStoryFromFile(file: File): Promise<StoryData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const storyData = JSON.parse(event.target?.result as string)
        
        // Validate required fields
        if (!storyData.title) {
          throw new Error('Invalid story file: missing title')
        }
        
        // Generate new ID to avoid conflicts
        const importedStory: StoryData = {
          ...storyData,
          id: generateStoryId(),
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
        
        resolve(importedStory)
      } catch (error) {
        reject(new Error('Failed to parse story file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Get story statistics
export function getStoryStats(): {
  totalStories: number
  storiesWithOutlines: number
  completedStories: number
  averageProgress: number
} {
  const stories = getAllStories()
  
  if (stories.length === 0) {
    return {
      totalStories: 0,
      storiesWithOutlines: 0,
      completedStories: 0,
      averageProgress: 0
    }
  }
  
  const storiesWithOutlines = stories.filter(s => s.stages.outlineWritten).length
  const completedStories = stories.filter(s => s.stages.percentageWritten >= 100).length
  const totalProgress = stories.reduce((sum, s) => sum + s.stages.percentageWritten, 0)
  const averageProgress = totalProgress / stories.length
  
  return {
    totalStories: stories.length,
    storiesWithOutlines,
    completedStories,
    averageProgress: Math.round(averageProgress)
  }
}

export type { StoryData, StoryMetadata }