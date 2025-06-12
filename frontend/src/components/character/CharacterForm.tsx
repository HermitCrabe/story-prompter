import { useState, useEffect } from 'react'
import { type CharacterData, type CharacterConfig } from '../../types/character'

interface CharacterFormProps {
  onCharacterChange: (character: CharacterData) => void
  initialCharacter?: CharacterData
}

export default function CharacterForm({ onCharacterChange, initialCharacter }: CharacterFormProps) {
  const [character, setCharacter] = useState<CharacterData>(
    initialCharacter || {
      Name: '',
      "Personal Traits": {},
      "Physical Traits": {}
    }
  )
  
  const [config, setConfig] = useState<CharacterConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config/character-traits.json')
        const configData = await response.json()
        setConfig(configData)
        
        // Initialize character with empty values for all configured traits
        setCharacter(prev => ({
          ...prev,
          "Personal Traits": Object.keys(configData["Personal Traits"]).reduce((acc, key) => {
            acc[key] = ''
            return acc
          }, {} as Record<string, string>),
          "Physical Traits": Object.keys(configData["Physical Traits"]).reduce((acc, key) => {
            acc[key] = ''
            return acc
          }, {} as Record<string, string>)
        }))
      } catch (error) {
        console.error('Failed to load character configuration:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  useEffect(() => {
    if (initialCharacter) {
      setCharacter(initialCharacter)
    }
  }, [initialCharacter])

  useEffect(() => {
    onCharacterChange(character)
  }, [character])

  const handleNameChange = (value: string) => {
    setCharacter(prev => ({ ...prev, Name: value }))
  }

  const handleTraitChange = (category: 'Personal Traits' | 'Physical Traits', trait: string, value: string) => {
    setCharacter(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [trait]: value
      }
    }))
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">Loading character configuration...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Name Field */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Character Name
        </label>
        <input
          type="text"
          value={character.Name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter character name"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Traits Column */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Personal Traits</h3>
          <div className="space-y-4">
            {Object.entries(config["Personal Traits"]).map(([trait, traitConfig]) => (
              <div key={trait}>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {traitConfig.label}
                </label>
                {traitConfig.type === 'textarea' ? (
                  <textarea
                    value={character["Personal Traits"][trait] || ''}
                    onChange={(e) => handleTraitChange('Personal Traits', trait, e.target.value)}
                    placeholder={traitConfig.placeholder}
                    rows={3}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={character["Personal Traits"][trait] || ''}
                    onChange={(e) => handleTraitChange('Personal Traits', trait, e.target.value)}
                    placeholder={traitConfig.placeholder}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Physical Traits Column */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Physical Traits</h3>
          <div className="space-y-4">
            {Object.entries(config["Physical Traits"]).map(([trait, traitConfig]) => (
              <div key={trait}>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {traitConfig.label}
                </label>
                {traitConfig.type === 'textarea' ? (
                  <textarea
                    value={character["Physical Traits"][trait] || ''}
                    onChange={(e) => handleTraitChange('Physical Traits', trait, e.target.value)}
                    placeholder={traitConfig.placeholder}
                    rows={3}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={character["Physical Traits"][trait] || ''}
                    onChange={(e) => handleTraitChange('Physical Traits', trait, e.target.value)}
                    placeholder={traitConfig.placeholder}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}