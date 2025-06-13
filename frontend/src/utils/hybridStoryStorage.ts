import { type StoryData } from './storyStorage'
import { 
  isFileSystemStoryStorageAvailable,
  saveStoryToFile,
  loadAllStoriesFromFiles,
  getStoryFromFileById,
  deleteStoryFile,
  updateStoryFile,
  initializeStoriesFolder,
  type FileSystemStoryData 
} from './fileSystemStoryStorage'
import { 
  getAllStories as getLocalStorageStories,
  saveStory as saveToLocalStorage,
  getStoryById as getLocalStorageStoryById,
  deleteStory as deleteFromLocalStorage,
  updateStoryStages as updateLocalStorageStages,
  updateStoryCharacters as updateLocalStorageCharacters
} from './storyStorage'

// Unified story interface
export interface HybridStoryData extends StoryData {
  fileName?: string // Only present for file system stories
  storageType: 'filesystem' | 'localstorage'
}

// Check if file system storage is available and configured
export async function isFileSystemStorageAvailable(): Promise<boolean> {
  return await isFileSystemStoryStorageAvailable()
}

// Save story using the best available storage method
export async function saveStory(story: Partial<StoryData>): Promise<HybridStoryData> {
  const useFileSystem = await isFileSystemStorageAvailable()
  
  if (useFileSystem) {
    try {
      // Initialize stories folder if needed
      await initializeStoriesFolder()
      
      const savedStory = await saveStoryToFile(story)
      return {
        ...savedStory,
        storageType: 'filesystem'
      }
    } catch (error) {
      console.error('File system save failed, falling back to localStorage:', error)
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  const savedStory = saveToLocalStorage(story)
  return {
    ...savedStory,
    storageType: 'localstorage'
  }
}

// Load all stories from the best available storage method
export async function getAllStories(): Promise<HybridStoryData[]> {
  const useFileSystem = await isFileSystemStorageAvailable()
  
  if (useFileSystem) {
    try {
      const fileStories = await loadAllStoriesFromFiles()
      return fileStories.map(story => ({
        ...story,
        storageType: 'filesystem' as const
      }))
    } catch (error) {
      console.error('File system load failed, falling back to localStorage:', error)
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  const localStories = getLocalStorageStories()
  return localStories.map(story => ({
    ...story,
    storageType: 'localstorage' as const
  }))
}

// Get a specific story by ID
export async function getStoryById(id: string): Promise<HybridStoryData | null> {
  const useFileSystem = await isFileSystemStorageAvailable()
  
  if (useFileSystem) {
    try {
      const story = await getStoryFromFileById(id)
      if (story) {
        return {
          ...story,
          storageType: 'filesystem'
        }
      }
    } catch (error) {
      console.error('File system get failed, falling back to localStorage:', error)
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  const story = getLocalStorageStoryById(id)
  if (story) {
    return {
      ...story,
      storageType: 'localstorage'
    }
  }
  
  return null
}

// Update story (handles both storage types)
export async function updateStory(id: string, updates: Partial<StoryData>): Promise<HybridStoryData | null> {
  const existingStory = await getStoryById(id)
  if (!existingStory) {
    return null
  }
  
  if (existingStory.storageType === 'filesystem' && existingStory.fileName) {
    try {
      const updatedStory = await updateStoryFile(existingStory as FileSystemStoryData, updates)
      return {
        ...updatedStory,
        storageType: 'filesystem'
      }
    } catch (error) {
      console.error('File system update failed:', error)
      return null
    }
  } else {
    // localStorage update
    const updatedStory = saveToLocalStorage({ ...existingStory, ...updates })
    return {
      ...updatedStory,
      storageType: 'localstorage'
    }
  }
}

// Delete story from the appropriate storage
export async function deleteStory(story: HybridStoryData): Promise<boolean> {
  if (story.storageType === 'filesystem' && story.fileName) {
    try {
      return await deleteStoryFile(story.fileName)
    } catch (error) {
      console.error('File system delete failed:', error)
      return false
    }
  } else {
    return deleteFromLocalStorage(story.id)
  }
}

// Update story stages
export async function updateStoryStages(id: string, stages: Partial<StoryData['stages']>): Promise<boolean> {
  const story = await getStoryById(id)
  if (!story) return false
  
  try {
    const updatedStory = await updateStory(id, { stages: { ...story.stages, ...stages } })
    return updatedStory !== null
  } catch (error) {
    console.error('Failed to update story stages:', error)
    return false
  }
}

// Update story characters
export async function updateStoryCharacters(id: string, characters: string[]): Promise<boolean> {
  const story = await getStoryById(id)
  if (!story) return false
  
  try {
    const updatedStory = await updateStory(id, { characters })
    return updatedStory !== null
  } catch (error) {
    console.error('Failed to update story characters:', error)
    return false
  }
}

// Export story to file (works for both storage types)
export function exportStoryToFile(story: HybridStoryData): void {
  // Remove storage-specific metadata for export
  const exportStory = {
    ...story,
    fileName: undefined,
    storageType: undefined
  }
  
  const dataStr = JSON.stringify(exportStory, null, 2)
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
        
        // Clean the data - remove storage-specific metadata
        const cleanStory: StoryData = {
          id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate new ID
          title: storyData.title,
          description: storyData.description || '',
          characters: storyData.characters || [],
          stages: {
            outlineWritten: false,
            percentageWritten: 0,
            ...storyData.stages
          },
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
        
        resolve(cleanStory)
      } catch (error) {
        reject(new Error('Failed to parse story file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Migrate stories from localStorage to file system (when user selects folder)
export async function migrateStoriesToFileSystem(): Promise<{ success: number; failed: number }> {
  const localStories = getLocalStorageStories()
  let success = 0
  let failed = 0
  
  // Initialize stories folder
  const initialized = await initializeStoriesFolder()
  if (!initialized) {
    return { success: 0, failed: localStories.length }
  }
  
  for (const story of localStories) {
    try {
      await saveStoryToFile(story)
      success++
    } catch (error) {
      console.error(`Failed to migrate story ${story.title}:`, error)
      failed++
    }
  }
  
  return { success, failed }
}

// Get storage status for UI display
export async function getStorageStatus(): Promise<{
  type: 'filesystem' | 'localstorage'
  folderName?: string
  storyCount: number
}> {
  const useFileSystem = await isFileSystemStorageAvailable()
  const stories = await getAllStories()
  
  if (useFileSystem) {
    try {
      const { getStorageFolder } = await import('./fileSystemStorage')
      const folder = await getStorageFolder()
      return {
        type: 'filesystem',
        folderName: folder?.name,
        storyCount: stories.length
      }
    } catch {
      // Fall through to localStorage
    }
  }
  
  return {
    type: 'localstorage',
    storyCount: stories.length
  }
}

// Get story statistics (compatible with both storage types)
export async function getStoryStats(): Promise<{
  totalStories: number
  storiesWithOutlines: number
  completedStories: number
  averageProgress: number
}> {
  const stories = await getAllStories()
  
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

export type { HybridStoryData }