import { useState, useEffect } from 'react'
import { getAllCharacters, type HybridCharacter } from '../../utils/hybridCharacterStorage'
import { getStoryById, updateStory, updateStoryCharacters, type HybridStoryData } from '../../utils/hybridStoryStorage'

interface StorySetupTabProps {
  storyId: string
}

export default function StorySetupTab({ storyId }: StorySetupTabProps) {
  const [availableCharacters, setAvailableCharacters] = useState<HybridCharacter[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [storyTitle, setStoryTitle] = useState('')
  const [storyDescription, setStoryDescription] = useState('')
  const [storyData, setStoryData] = useState<HybridStoryData | null>(null)
  
  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isSavingTitle, setIsSavingTitle] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load available characters
        const characters = await getAllCharacters()
        setAvailableCharacters(characters)
        
        // Load story data
        const story = await getStoryById(storyId)
        if (story) {
          setStoryData(story)
          setStoryTitle(story.title)
          setStoryDescription(story.description)
          setSelectedCharacters(story.characters)
        }
      } catch (error) {
        console.error('Failed to load story data:', error)
      }
    }
    
    loadData()
  }, [storyId])

  const handleCharacterToggle = (characterId: string) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    )
  }

  const handleEditTitle = () => {
    setEditedTitle(storyTitle)
    setIsEditingTitle(true)
  }

  const handleCancelTitleEdit = () => {
    setEditedTitle('')
    setIsEditingTitle(false)
  }

  const handleConfirmTitleEdit = async () => {
    if (!editedTitle.trim() || editedTitle.trim() === storyTitle) {
      handleCancelTitleEdit()
      return
    }

    try {
      setIsSavingTitle(true)
      const updatedStory = await updateStory(storyId, { title: editedTitle.trim() })
      if (updatedStory) {
        setStoryTitle(editedTitle.trim())
        setStoryData(updatedStory)
      }
      setIsEditingTitle(false)
      setEditedTitle('')
    } catch (error) {
      console.error('Failed to update story title:', error)
    } finally {
      setIsSavingTitle(false)
    }
  }

  // Auto-save story data when changes are made (excluding title changes)
  useEffect(() => {
    if (!storyData) return // Don't save if no story is loaded
    
    const hasChanges = 
      storyDescription !== storyData.description ||
      JSON.stringify(selectedCharacters.sort()) !== JSON.stringify(storyData.characters.sort())
    
    if (hasChanges) {
      const timeoutId = setTimeout(async () => {
        try {
          await updateStory(storyId, {
            description: storyDescription,
            characters: selectedCharacters
          })
        } catch (error) {
          console.error('Failed to save story:', error)
        }
      }, 1000) // Auto-save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId)
    }
  }, [storyId, storyDescription, selectedCharacters, storyData])

  const selectedCharacterData = availableCharacters.filter(char => 
    selectedCharacters.includes(char.id)
  )

  return (
    <div className="space-y-6">
      {/* Story Basic Info */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Story Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Story Title
            </label>
            {isEditingTitle ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter story title..."
                  className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmTitleEdit()
                    } else if (e.key === 'Escape') {
                      handleCancelTitleEdit()
                    }
                  }}
                  autoFocus
                  disabled={isSavingTitle}
                />
                <button
                  onClick={handleConfirmTitleEdit}
                  disabled={!editedTitle.trim() || editedTitle.trim() === storyTitle || isSavingTitle}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center"
                >
                  {isSavingTitle ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleCancelTitleEdit}
                  disabled={isSavingTitle}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storyTitle}
                  placeholder="Enter story title..."
                  className="flex-1 p-3 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 cursor-not-allowed"
                  disabled
                />
                <button
                  onClick={handleEditTitle}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200 flex items-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
              placeholder="Brief description of your story..."
              rows={3}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Character Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Characters</h3>
        
        {availableCharacters.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-3">No characters found</p>
            <p className="text-sm text-gray-500">
              Create characters in the Character Creator to use them in your stories.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-300 text-sm mb-4">
              Select characters to include in this story:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {availableCharacters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => handleCharacterToggle(character.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedCharacters.includes(character.id)
                      ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500/50'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{character.Name || 'Unnamed Character'}</h4>
                    {selectedCharacters.includes(character.id) && (
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Show some character traits */}
                  <div className="mt-2 text-sm text-gray-400">
                    {character["Physical Traits"]?.build && (
                      <span className="inline-block bg-gray-600 px-2 py-1 rounded text-xs mr-1 mb-1">
                        {character["Physical Traits"].build}
                      </span>
                    )}
                    {character["Personal Traits"]?.personality && (
                      <span className="inline-block bg-gray-600 px-2 py-1 rounded text-xs mr-1 mb-1">
                        {character["Personal Traits"].personality.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Characters Summary */}
            {selectedCharacters.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">
                  Selected Characters ({selectedCharacters.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCharacterData.map((character) => (
                    <span
                      key={character.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/30 text-blue-300 border border-blue-500/30"
                    >
                      {character.Name || 'Unnamed Character'}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCharacterToggle(character.id)
                        }}
                        className="ml-2 text-blue-400 hover:text-blue-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}