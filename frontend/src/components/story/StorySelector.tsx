import { useState, useEffect } from 'react'
import { getAllStories, saveStory, type HybridStoryData } from '../../utils/hybridStoryStorage'

interface StorySelectorProps {
  selectedStory: string | null
  onStorySelect: (storyId: string | null) => void
}

export default function StorySelector({ selectedStory, onStorySelect }: StorySelectorProps) {
  const [stories, setStories] = useState<HybridStoryData[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [newStoryDescription, setNewStoryDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setIsLoading(true)
      const allStories = await getAllStories()
      setStories(allStories)
    } catch (error) {
      console.error('Failed to load stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    setShowCreateDialog(true)
    setIsDropdownOpen(false)
  }

  const handleConfirmCreate = async () => {
    if (!newStoryTitle.trim()) return
    
    try {
      setIsCreating(true)
      const newStory = await saveStory({
        title: newStoryTitle.trim(),
        description: newStoryDescription.trim(),
        characters: [],
        stages: {
          outlineWritten: false,
          percentageWritten: 0
        }
      })
      setStories(prev => [...prev, newStory])
      onStorySelect(newStory.id)
      handleCancelCreate()
    } catch (error) {
      console.error('Failed to create new story:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelCreate = () => {
    setShowCreateDialog(false)
    setNewStoryTitle('')
    setNewStoryDescription('')
    setIsCreating(false)
  }

  const handleStorySelect = (storyId: string) => {
    onStorySelect(storyId)
    setIsDropdownOpen(false)
  }

  const selectedStoryData = stories.find(s => s.id === selectedStory)
  const getProgressInfo = (story: HybridStoryData) => {
    const parts = []
    if (story.stages.outlineWritten) parts.push('Outlined')
    if (story.stages.percentageWritten > 0) parts.push(`${story.stages.percentageWritten}% written`)
    return parts.length > 0 ? parts.join(', ') : 'Not started'
  }

  return (
    <>
      {/* Create Story Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Story</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Enter story title..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newStoryTitle.trim()) {
                      handleConfirmCreate()
                    } else if (e.key === 'Escape') {
                      handleCancelCreate()
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newStoryDescription}
                  onChange={(e) => setNewStoryDescription(e.target.value)}
                  placeholder="Brief description of your story..."
                  rows={3}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelCreate}
                disabled={isCreating}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={!newStoryTitle.trim() || isCreating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
              >
                {isCreating ? 'Creating...' : 'Create Story'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Current Story
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span>
                {selectedStoryData ? selectedStoryData.title : 'Select a story...'}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-gray-400 text-center">
                    Loading stories...
                  </div>
                ) : stories.length === 0 ? (
                  <div className="p-4 text-gray-400 text-center">
                    No stories found. Create your first story!
                  </div>
                ) : (
                  stories.map((story) => (
                    <button
                      key={story.id}
                      onClick={() => handleStorySelect(story.id)}
                      className={`w-full text-left p-3 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-700 last:border-b-0 ${
                        selectedStory === story.id ? 'bg-blue-900/30 text-blue-300' : 'text-gray-200'
                      }`}
                    >
                      <div className="font-medium">{story.title}</div>
                      {story.description && (
                        <div className="text-sm text-gray-400 mt-1 line-clamp-1">
                          {story.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {getProgressInfo(story)} • {story.characters.length} characters
                      </div>
                    </button>
                  ))
                )}
                
                <div className="border-t border-gray-600 p-2">
                  <button
                    onClick={handleCreateNew}
                    className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 transition-colors duration-200"
                  >
                    + Create New Story
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedStoryData && (
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Progress</div>
            <div className="text-sm text-gray-300">
              {getProgressInfo(selectedStoryData)}
            </div>
          </div>
        )}
      </div>

      {selectedStoryData && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Last modified: {new Date(selectedStoryData.lastModified).toLocaleDateString()}
          </div>
          <button
            onClick={() => {
              onStorySelect(null)
              setIsDropdownOpen(false)
            }}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
          >
            Clear Selection
          </button>
        </div>
      )}
      </div>
    </>
  )
}