import { useState, useRef, useCallback } from 'react'
import { type CharacterData } from '../../types/character'
import { type HybridCharacter } from '../../utils/hybridCharacterStorage'
import { saveCharacter, exportCharacterToFile, importCharacterFromFile } from '../../utils/hybridCharacterStorage'
import CharacterForm from '../character/CharacterForm'
import CharacterSelector from '../character/CharacterSelector'
import { useStorage } from '../../contexts/StorageContext'

export default function CharacterCreatorPage() {
  const [character, setCharacter] = useState<CharacterData | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | undefined>()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const { hasStorageFolder } = useStorage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCharacterChange = useCallback((newCharacter: CharacterData) => {
    setCharacter(newCharacter)
    setSaveStatus('idle')
  }, [])

  const handleCharacterSelect = (selectedCharacter: HybridCharacter | null) => {
    if (selectedCharacter) {
      setCharacter(selectedCharacter)
      setSelectedCharacterId(selectedCharacter.id)
    } else {
      // Create new character
      setCharacter({
        Name: '',
        "Personal Traits": {},
        "Physical Traits": {}
      })
      setSelectedCharacterId(undefined)
    }
    setSaveStatus('idle')
  }

  const handleSaveCharacter = async () => {
    if (!character || !character.Name.trim()) {
      alert('Please enter a character name before saving.')
      return
    }

    try {
      setSaveStatus('saving')
      const savedCharacter = saveCharacter(character)
      setSelectedCharacterId(savedCharacter.id)
      setSaveStatus('saved')
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      alert('Failed to save character. Please try again.')
    }
  }

  const handleExportCharacter = () => {
    if (character && character.Name) {
      const hybridCharacter: HybridCharacter = {
        ...character,
        id: selectedCharacterId || character.Name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        lastModified: new Date().toISOString(),
        storageType: hasStorageFolder ? 'filesystem' : 'localstorage'
      }
      exportCharacterToFile(hybridCharacter)
    }
  }

  const handleImportCharacter = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importedCharacter = await importCharacterFromFile(file)
      setCharacter(importedCharacter)
      setSelectedCharacterId(undefined) // Clear selection since this is imported
      setSaveStatus('idle')
    } catch (error) {
      alert('Failed to import character file. Please check the file format.')
    }

    // Clear the file input
    event.target.value = ''
  }

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...'
      case 'saved': return 'Saved!'
      case 'error': return 'Error'
      default: return 'Save Character'
    }
  }

  const getSaveButtonColor = () => {
    switch (saveStatus) {
      case 'saved': return 'bg-green-600 hover:bg-green-700'
      case 'error': return 'bg-red-600 hover:bg-red-700'
      default: return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Character Creator</h2>
          <p className="text-gray-300">
            Create and customize character profiles for your stories.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleImportCharacter}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Import
          </button>
          
          <button
            onClick={handleExportCharacter}
            disabled={!character || !character.Name}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Export
          </button>
          
          <button
            onClick={handleSaveCharacter}
            disabled={!character || !character.Name.trim() || saveStatus === 'saving'}
            className={`px-4 py-2 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${getSaveButtonColor()}`}
          >
            {getSaveButtonText()}
          </button>
        </div>
      </div>

      {/* Character Selector */}
      <div className="mb-6">
        <CharacterSelector 
          onCharacterSelect={handleCharacterSelect}
          selectedCharacterId={selectedCharacterId}
        />
      </div>
      
      {/* Character Form */}
      {character && (
        <CharacterForm 
          onCharacterChange={handleCharacterChange}
          initialCharacter={character}
          key={selectedCharacterId || 'new'} // Force re-render when character changes
        />
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  )
}