import { type StoryData } from './storyStorage'
import { 
  isFileSystemSupported, 
  getStorageFolder, 
  selectStorageFolder 
} from './fileSystemStorage'

export interface FileSystemStoryData extends StoryData {
  fileName: string
}

const STORIES_FOLDER = 'stories'

// Get or create the stories subdirectory
async function getStoriesDirectory(rootHandle: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  try {
    // Try to get existing stories directory
    return await rootHandle.getDirectoryHandle(STORIES_FOLDER)
  } catch (error) {
    // Create stories directory if it doesn't exist
    return await rootHandle.getDirectoryHandle(STORIES_FOLDER, { create: true })
  }
}

// Generate a safe filename from story title
function generateStoryFileName(title: string, id: string): string {
  const safeTitle = title.trim() 
    ? title.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)
    : `story-${Date.now()}`
  
  return `${safeTitle}-${id.split('-').pop()}.json`
}

// Save a story to file system
export async function saveStoryToFile(story: Partial<StoryData>): Promise<FileSystemStoryData> {
  const rootHandle = await getStorageFolder()
  if (!rootHandle) {
    throw new Error('No storage folder selected')
  }

  try {
    const storiesDir = await getStoriesDirectory(rootHandle)
    
    // Generate story ID if not provided
    const storyId = story.id || `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fileName = generateStoryFileName(story.title || 'Untitled Story', storyId)
    
    // Create the complete story data
    const now = new Date().toISOString()
    const completeStory: FileSystemStoryData = {
      id: storyId,
      title: story.title || 'Untitled Story',
      description: story.description || '',
      characters: story.characters || [],
      stages: {
        outlineWritten: false,
        percentageWritten: 0,
        ...story.stages
      },
      createdAt: story.createdAt || now,
      lastModified: now,
      fileName,
      ...story
    }
    
    // Write to file
    const fileHandle = await storiesDir.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(completeStory, null, 2))
    await writable.close()
    
    return completeStory
  } catch (error) {
    console.error('Failed to save story to file:', error)
    throw error
  }
}

// Load all stories from file system
export async function loadAllStoriesFromFiles(): Promise<FileSystemStoryData[]> {
  const rootHandle = await getStorageFolder()
  if (!rootHandle) {
    return []
  }

  try {
    const storiesDir = await getStoriesDirectory(rootHandle)
    const stories: FileSystemStoryData[] = []
    
    // Read all .json files in the stories directory
    for await (const [name, handle] of storiesDir.entries()) {
      if (handle.kind === 'file' && name.endsWith('.json')) {
        try {
          const file = await handle.getFile()
          const content = await file.text()
          const story = JSON.parse(content) as FileSystemStoryData
          
          // Ensure story has required metadata
          if (!story.id) {
            story.id = name.replace('.json', '')
          }
          if (!story.fileName) {
            story.fileName = name
          }
          if (!story.lastModified) {
            story.lastModified = new Date(file.lastModified).toISOString()
          }
          if (!story.stages) {
            story.stages = { outlineWritten: false, percentageWritten: 0 }
          }
          
          stories.push(story)
        } catch (error) {
          console.error(`Failed to load story from ${name}:`, error)
        }
      }
    }
    
    // Sort by last modified (newest first)
    return stories.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  } catch (error) {
    console.error('Failed to load stories from files:', error)
    return []
  }
}

// Get a specific story by ID from file system
export async function getStoryFromFileById(id: string): Promise<FileSystemStoryData | null> {
  const stories = await loadAllStoriesFromFiles()
  return stories.find(story => story.id === id) || null
}

// Delete a story file
export async function deleteStoryFile(fileName: string): Promise<boolean> {
  const rootHandle = await getStorageFolder()
  if (!rootHandle) {
    return false
  }

  try {
    const storiesDir = await getStoriesDirectory(rootHandle)
    await storiesDir.removeEntry(fileName)
    return true
  } catch (error) {
    console.error('Failed to delete story file:', error)
    return false
  }
}

// Update an existing story file (handles filename changes for title updates)
export async function updateStoryFile(existingStory: FileSystemStoryData, updates: Partial<StoryData>): Promise<FileSystemStoryData> {
  const rootHandle = await getStorageFolder()
  if (!rootHandle) {
    throw new Error('No storage folder selected')
  }

  try {
    const storiesDir = await getStoriesDirectory(rootHandle)
    
    // Check if title changed and we need to rename the file
    const titleChanged = updates.title && updates.title !== existingStory.title
    const newFileName = titleChanged 
      ? generateStoryFileName(updates.title, existingStory.id)
      : existingStory.fileName
    
    // Create updated story
    const updatedStory: FileSystemStoryData = {
      ...existingStory,
      ...updates,
      lastModified: new Date().toISOString(),
      fileName: newFileName
    }
    
    // If filename changed, delete old file
    if (titleChanged && newFileName !== existingStory.fileName) {
      try {
        await storiesDir.removeEntry(existingStory.fileName)
      } catch (error) {
        console.warn('Failed to delete old story file:', error)
      }
    }
    
    // Write updated content to file
    const fileHandle = await storiesDir.getFileHandle(newFileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(updatedStory, null, 2))
    await writable.close()
    
    return updatedStory
  } catch (error) {
    console.error('Failed to update story file:', error)
    throw error
  }
}

// Check if file system storage is available for stories
export async function isFileSystemStoryStorageAvailable(): Promise<boolean> {
  if (!isFileSystemSupported()) {
    return false
  }
  
  try {
    const folder = await getStorageFolder()
    return folder !== null
  } catch (error) {
    return false
  }
}

// Initialize stories folder (create if doesn't exist)
export async function initializeStoriesFolder(): Promise<boolean> {
  try {
    const rootHandle = await getStorageFolder()
    if (!rootHandle) {
      return false
    }
    
    await getStoriesDirectory(rootHandle)
    return true
  } catch (error) {
    console.error('Failed to initialize stories folder:', error)
    return false
  }
}