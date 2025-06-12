import { type CharacterData } from '../types/character'

// Type definitions for File System Access API
declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
  }
}

export interface FileSystemCharacter extends CharacterData {
  id: string
  lastModified: string
  fileName: string
}

const FOLDER_HANDLE_KEY = 'story-prompter-folder-handle'
const CHARACTERS_FOLDER = 'characters'

// Check if File System Access API is supported
export function isFileSystemSupported(): boolean {
  return 'showDirectoryPicker' in window && 'requestPermission' in FileSystemHandle.prototype
}

// Store the folder handle in IndexedDB (localStorage can't store handles)
async function storeFolderHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    // Store handle in IndexedDB since localStorage can't handle FileSystemHandle objects
    const dbName = 'story-prompter-fs'
    const dbVersion = 2  // Increment version to force upgrade
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)
      
      request.onerror = () => reject(request.error)
      
      request.onupgradeneeded = () => {
        const db = request.result
        // Delete existing object store if it exists and recreate it
        if (db.objectStoreNames.contains('handles')) {
          db.deleteObjectStore('handles')
        }
        db.createObjectStore('handles')
      }
      
      request.onsuccess = () => {
        const db = request.result
        
        const transaction = db.transaction(['handles'], 'readwrite')
        const store = transaction.objectStore('handles')
        
        store.put(handle, FOLDER_HANDLE_KEY)
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }
    })
  } catch (error) {
    console.error('Failed to store folder handle:', error)
    throw error
  }
}

// Retrieve the stored folder handle
async function getStoredFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const dbName = 'story-prompter-fs'
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 2)
      
      request.onerror = () => resolve(null)
      
      request.onupgradeneeded = () => {
        const db = request.result
        if (db.objectStoreNames.contains('handles')) {
          db.deleteObjectStore('handles')
        }
        db.createObjectStore('handles')
      }
      
      request.onsuccess = () => {
        const db = request.result
        
        if (!db.objectStoreNames.contains('handles')) {
          resolve(null)
          return
        }
        
        const transaction = db.transaction(['handles'], 'readonly')
        const store = transaction.objectStore('handles')
        const getRequest = store.get(FOLDER_HANDLE_KEY)
        
        getRequest.onsuccess = () => resolve(getRequest.result || null)
        getRequest.onerror = () => resolve(null)
      }
    })
  } catch (error) {
    console.error('Failed to retrieve folder handle:', error)
    return null
  }
}

// Request permission for the folder handle
async function requestPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    const permission = await handle.requestPermission({ mode: 'readwrite' })
    return permission === 'granted'
  } catch (error) {
    console.error('Permission request failed:', error)
    return false
  }
}

// Get or create the characters subdirectory
async function getCharactersDirectory(rootHandle: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  try {
    // Try to get existing characters directory
    return await rootHandle.getDirectoryHandle(CHARACTERS_FOLDER)
  } catch (error) {
    // Create characters directory if it doesn't exist
    return await rootHandle.getDirectoryHandle(CHARACTERS_FOLDER, { create: true })
  }
}

// Select and store a new folder
export async function selectStorageFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemSupported()) {
    throw new Error('File System Access API is not supported in this browser')
  }

  try {
    const handle = await window.showDirectoryPicker!()
    
    // Request permission
    const hasPermission = await requestPermission(handle)
    if (!hasPermission) {
      throw new Error('Permission denied for folder access')
    }
    
    // Store the handle
    await storeFolderHandle(handle)
    
    // Create characters subdirectory if it doesn't exist
    await getCharactersDirectory(handle)
    
    return handle
  } catch (error) {
    console.error('Failed to select storage folder:', error)
    throw error
  }
}

// Get the current storage folder (from stored handle)
export async function getStorageFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemSupported()) {
    return null
  }

  try {
    const handle = await getStoredFolderHandle()
    if (!handle) {
      return null
    }

    // Check if we still have permission
    const hasPermission = await requestPermission(handle)
    if (!hasPermission) {
      return null
    }

    return handle
  } catch (error) {
    console.error('Failed to get storage folder:', error)
    return null
  }
}

// Save a character to file system
export async function saveCharacterToFile(character: CharacterData): Promise<FileSystemCharacter> {
  const rootHandle = await getStorageFolder()
  if (!rootHandle) {
    throw new Error('No storage folder selected')
  }

  try {
    const charactersDir = await getCharactersDirectory(rootHandle)
    
    // Generate filename from character name
    const fileName = character.Name.trim() 
      ? `${character.Name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`
      : `character-${Date.now()}.json`
    
    // Create the character with metadata
    const fileCharacter: FileSystemCharacter = {
      ...character,
      id: fileName.replace('.json', ''),
      lastModified: new Date().toISOString(),
      fileName
    }
    
    // Write to file
    const fileHandle = await charactersDir.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(fileCharacter, null, 2))
    await writable.close()
    
    return fileCharacter
  } catch (error) {
    console.error('Failed to save character to file:', error)
    throw error
  }
}

// Load all characters from file system
export async function loadAllCharactersFromFiles(): Promise<FileSystemCharacter[]> {
  const rootHandle = await getStorageFolder()
  if (!rootHandle) {
    return []
  }

  try {
    const charactersDir = await getCharactersDirectory(rootHandle)
    const characters: FileSystemCharacter[] = []
    
    // Read all .json files in the characters directory
    for await (const [name, handle] of charactersDir.entries()) {
      if (handle.kind === 'file' && name.endsWith('.json')) {
        try {
          const file = await handle.getFile()
          const content = await file.text()
          const character = JSON.parse(content) as FileSystemCharacter
          
          // Ensure character has required metadata
          if (!character.id) {
            character.id = name.replace('.json', '')
          }
          if (!character.fileName) {
            character.fileName = name
          }
          if (!character.lastModified) {
            character.lastModified = new Date(file.lastModified).toISOString()
          }
          
          characters.push(character)
        } catch (error) {
          console.error(`Failed to load character from ${name}:`, error)
        }
      }
    }
    
    // Sort by last modified (newest first)
    return characters.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  } catch (error) {
    console.error('Failed to load characters from files:', error)
    return []
  }
}

// Delete a character file
export async function deleteCharacterFile(fileName: string): Promise<boolean> {
  const rootHandle = await getStorageFolder()
  if (!rootHandle) {
    return false
  }

  try {
    const charactersDir = await getCharactersDirectory(rootHandle)
    await charactersDir.removeEntry(fileName)
    return true
  } catch (error) {
    console.error('Failed to delete character file:', error)
    return false
  }
}

// Clear the stored folder handle (for settings/reset)
export async function clearStorageFolder(): Promise<void> {
  try {
    const dbName = 'story-prompter-fs'
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 2)
      
      request.onsuccess = () => {
        const db = request.result
        if (db.objectStoreNames.contains('handles')) {
          const transaction = db.transaction(['handles'], 'readwrite')
          const store = transaction.objectStore('handles')
          store.delete(FOLDER_HANDLE_KEY)
          transaction.oncomplete = () => resolve()
          transaction.onerror = () => reject(transaction.error)
        } else {
          resolve()
        }
      }
      
      request.onerror = () => resolve() // Ignore errors
    })
  } catch (error) {
    console.error('Failed to clear folder handle:', error)
  }
}