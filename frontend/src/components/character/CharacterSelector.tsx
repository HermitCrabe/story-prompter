import { useState, useEffect } from 'react'
import { type HybridCharacter } from '../../utils/hybridCharacterStorage'
import { getAllCharacters, deleteCharacter } from '../../utils/hybridCharacterStorage'

interface CharacterSelectorProps {
  onCharacterSelect: (character: HybridCharacter | null) => void
  selectedCharacterId?: string
}

export default function CharacterSelector({ onCharacterSelect, selectedCharacterId }: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<HybridCharacter[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadCharacters = async () => {
    const allCharacters = await getAllCharacters()
    setCharacters(allCharacters)
  }

  useEffect(() => {
    loadCharacters()
  }, [])

  const handleCharacterSelect = (character: StoredCharacter | null) => {
    onCharacterSelect(character)
    setIsOpen(false)
  }

  const handleDeleteCharacter = async (e: React.MouseEvent, character: HybridCharacter) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this character?')) {
      const success = await deleteCharacter(character)
      if (success) {
        loadCharacters()
        // If we deleted the currently selected character, clear selection
        if (selectedCharacterId === character.id) {
          onCharacterSelect(null)
        }
      }
    }
  }

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId)

  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const updateDropdownPosition = () => {
    if (buttonRef) {
      const rect = buttonRef.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 1000
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
      window.addEventListener('resize', updateDropdownPosition)
      return () => window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [isOpen, buttonRef])

  return (
    <div className="relative">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Load Character
        </label>
      </div>
      
      <button
        ref={setButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center"
      >
        <span className={selectedCharacter ? 'text-white' : 'text-gray-400'}>
          {selectedCharacter ? selectedCharacter.Name : 'Select a character or create new...'}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          style={dropdownStyle}
          className="bg-gray-700 border border-gray-600 rounded-lg shadow-lg"
        >
          {/* New Character Option */}
          <button
            onClick={() => handleCharacterSelect(null)}
            className="w-full p-3 text-left hover:bg-gray-600 focus:bg-gray-600 focus:outline-none text-gray-300 border-b border-gray-600"
          >
            <div className="font-medium">Create New Character</div>
            <div className="text-sm text-gray-400">Start with a blank character</div>
          </button>

          {/* Existing Characters */}
          {characters.length === 0 ? (
            <div className="p-3 text-gray-400 text-sm">
              No saved characters found
            </div>
          ) : (
            characters.map((character) => (
              <div
                key={character.id}
                className="relative group flex hover:bg-gray-600"
              >
                <button
                  onClick={() => handleCharacterSelect(character)}
                  className="flex-1 p-3 text-left focus:bg-gray-600 focus:outline-none text-white"
                >
                  <div className="font-medium">{character.Name || 'Unnamed Character'}</div>
                  <div className="text-sm text-gray-400">
                    {character['Personal Traits'].Species && (
                      <span>{character['Personal Traits'].Species}</span>
                    )}
                    {character.lastModified && (
                      <span className="ml-2">
                        Modified: {new Date(character.lastModified).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={(e) => handleDeleteCharacter(e, character)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-3 hover:bg-red-600 text-red-400 hover:text-white focus:outline-none focus:opacity-100"
                  title="Delete character"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 999 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}