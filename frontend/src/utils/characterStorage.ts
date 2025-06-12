import { type CharacterData } from '../types/character'

const STORAGE_KEY = 'story-prompter-characters'

export interface StoredCharacter extends CharacterData {
  id: string
  lastModified: string
}

// Get all characters from localStorage
export function getAllCharacters(): StoredCharacter[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading characters from localStorage:', error)
    return []
  }
}

// Save a character to localStorage
export function saveCharacter(character: CharacterData): StoredCharacter {
  const characters = getAllCharacters()
  
  // Generate ID from name, or use timestamp if no name
  const id = character.Name.trim() 
    ? character.Name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
    : `character-${Date.now()}`
  
  const storedCharacter: StoredCharacter = {
    ...character,
    id,
    lastModified: new Date().toISOString()
  }
  
  // Update existing character or add new one
  const existingIndex = characters.findIndex(c => c.id === id)
  if (existingIndex >= 0) {
    characters[existingIndex] = storedCharacter
  } else {
    characters.push(storedCharacter)
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
    return storedCharacter
  } catch (error) {
    console.error('Error saving character to localStorage:', error)
    throw new Error('Failed to save character')
  }
}

// Get a specific character by ID
export function getCharacterById(id: string): StoredCharacter | null {
  const characters = getAllCharacters()
  return characters.find(c => c.id === id) || null
}

// Delete a character by ID
export function deleteCharacter(id: string): boolean {
  try {
    const characters = getAllCharacters()
    const filteredCharacters = characters.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCharacters))
    return true
  } catch (error) {
    console.error('Error deleting character:', error)
    return false
  }
}

// Export character data to JSON file (for download)
export function exportCharacterToFile(character: StoredCharacter): void {
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
        
        resolve(characterData)
      } catch (error) {
        reject(new Error('Failed to parse character file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}