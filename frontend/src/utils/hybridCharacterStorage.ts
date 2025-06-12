import { type CharacterData } from '../types/character'
import { 
  isFileSystemSupported, 
  getStorageFolder, 
  saveCharacterToFile, 
  loadAllCharactersFromFiles, 
  deleteCharacterFile,
  type FileSystemCharacter 
} from './fileSystemStorage'
import { 
  getAllCharacters as getLocalStorageCharacters, 
  saveCharacter as saveToLocalStorage, 
  deleteCharacter as deleteFromLocalStorage,
  type StoredCharacter 
} from './characterStorage'

// Unified character interface
export interface HybridCharacter extends CharacterData {
  id: string
  lastModified: string
  fileName?: string // Only present for file system characters
  storageType: 'filesystem' | 'localstorage'
}

// Check if file system storage is available and configured
export async function isFileSystemStorageAvailable(): Promise<boolean> {
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

// Save character using the best available storage method
export async function saveCharacter(character: CharacterData): Promise<HybridCharacter> {
  const useFileSystem = await isFileSystemStorageAvailable()
  
  if (useFileSystem) {
    try {
      const savedCharacter = await saveCharacterToFile(character)
      return {
        ...savedCharacter,
        storageType: 'filesystem'
      }
    } catch (error) {
      console.error('File system save failed, falling back to localStorage:', error)
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  const savedCharacter = saveToLocalStorage(character)
  return {
    ...savedCharacter,
    storageType: 'localstorage'
  }
}

// Load all characters from the best available storage method
export async function getAllCharacters(): Promise<HybridCharacter[]> {
  const useFileSystem = await isFileSystemStorageAvailable()
  
  if (useFileSystem) {
    try {
      const fileCharacters = await loadAllCharactersFromFiles()
      return fileCharacters.map(char => ({
        ...char,
        storageType: 'filesystem' as const
      }))
    } catch (error) {
      console.error('File system load failed, falling back to localStorage:', error)
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  const localCharacters = getLocalStorageCharacters()
  return localCharacters.map(char => ({
    ...char,
    storageType: 'localstorage' as const
  }))
}

// Delete character from the appropriate storage
export async function deleteCharacter(character: HybridCharacter): Promise<boolean> {
  if (character.storageType === 'filesystem' && character.fileName) {
    try {
      return await deleteCharacterFile(character.fileName)
    } catch (error) {
      console.error('File system delete failed:', error)
      return false
    }
  } else {
    return deleteFromLocalStorage(character.id)
  }
}

// Get a specific character by ID
export async function getCharacterById(id: string): Promise<HybridCharacter | null> {
  const characters = await getAllCharacters()
  return characters.find(c => c.id === id) || null
}

// Export character to file (works for both storage types)
export function exportCharacterToFile(character: HybridCharacter): void {
  const dataStr = JSON.stringify(character, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${character.Name || 'character'}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  URL.revokeObjectURL(link.href)
}

// Import character from JSON file
export function importCharacterFromFile(file: File): Promise<CharacterData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const characterData = JSON.parse(event.target?.result as string)
        
        // Validate the character data structure
        if (!characterData.Name || !characterData['Personal Traits'] || !characterData['Physical Traits']) {
          throw new Error('Invalid character file format')
        }
        
        // Clean the data - remove storage-specific metadata
        const cleanCharacter: CharacterData = {
          Name: characterData.Name,
          'Personal Traits': characterData['Personal Traits'],
          'Physical Traits': characterData['Physical Traits']
        }
        
        resolve(cleanCharacter)
      } catch (error) {
        reject(new Error('Failed to parse character file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Migrate characters from localStorage to file system (when user selects folder)
export async function migrateCharactersToFileSystem(): Promise<{ success: number; failed: number }> {
  const localCharacters = getLocalStorageCharacters()
  let success = 0
  let failed = 0
  
  for (const character of localCharacters) {
    try {
      await saveCharacterToFile(character)
      success++
    } catch (error) {
      console.error(`Failed to migrate character ${character.Name}:`, error)
      failed++
    }
  }
  
  return { success, failed }
}

// Get storage status for UI display
export async function getStorageStatus(): Promise<{
  type: 'filesystem' | 'localstorage'
  folderName?: string
  characterCount: number
}> {
  const useFileSystem = await isFileSystemStorageAvailable()
  const characters = await getAllCharacters()
  
  if (useFileSystem) {
    try {
      const folder = await getStorageFolder()
      return {
        type: 'filesystem',
        folderName: folder?.name,
        characterCount: characters.length
      }
    } catch {
      // Fall through to localStorage
    }
  }
  
  return {
    type: 'localstorage',
    characterCount: characters.length
  }
}