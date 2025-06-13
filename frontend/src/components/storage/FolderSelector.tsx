import { useState, useEffect } from 'react'
import { isFileSystemSupported, selectStorageFolder, getStorageFolder, clearStorageFolder } from '../../utils/fileSystemStorage'

interface FolderSelectorProps {
  onFolderChange: (hasFolder: boolean) => void
}

export default function FolderSelector({ onFolderChange }: FolderSelectorProps) {
  const [hasFolder, setHasFolder] = useState(false)
  const [folderName, setFolderName] = useState<string>('')
  const [isSelecting, setIsSelecting] = useState(false)
  const [error, setError] = useState<string>('')

  const checkExistingFolder = async () => {
    try {
      const handle = await getStorageFolder()
      if (handle) {
        setHasFolder(true)
        setFolderName(handle.name)
        onFolderChange(true)
      } else {
        setHasFolder(false)
        setFolderName('')
        onFolderChange(false)
      }
    } catch (error) {
      console.error('Failed to check existing folder:', error)
      setHasFolder(false)
      setFolderName('')
      onFolderChange(false)
    }
  }

  useEffect(() => {
    if (isFileSystemSupported()) {
      checkExistingFolder()
    }
  }, [])

  const handleSelectFolder = async () => {
    setIsSelecting(true)
    setError('')
    
    try {
      const handle = await selectStorageFolder()
      if (handle) {
        setHasFolder(true)
        setFolderName(handle.name)
        onFolderChange(true)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select folder'
      setError(errorMessage)
      console.error('Failed to select folder:', error)
    } finally {
      setIsSelecting(false)
    }
  }

  const handleChangeFolder = async () => {
    setError('')
    try {
      await clearStorageFolder()
      await handleSelectFolder()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change folder'
      setError(errorMessage)
    }
  }

  const handleClearFolder = async () => {
    if (confirm('Are you sure you want to stop using local folder storage? This will not delete your files, but you\'ll need to select the folder again to access them.')) {
      try {
        await clearStorageFolder()
        setHasFolder(false)
        setFolderName('')
        onFolderChange(false)
      } catch (error) {
        console.error('Failed to clear folder:', error)
      }
    }
  }

  if (!isFileSystemSupported()) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-yellow-400 font-medium">Local File Storage Not Available</h3>
            <p className="text-yellow-200 text-sm mt-1">
              Your browser doesn't support the File System Access API. Characters will be saved to browser storage instead.
              For full file system support, try using Chrome or Edge.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      
      {!hasFolder ? (
        <button
          onClick={handleSelectFolder}
          disabled={isSelecting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          {isSelecting ? 'Selecting...' : 'Select Storage Folder'}
        </button>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-white text-sm font-medium">{folderName}</p>
              <p className="text-gray-400 text-xs">
                Saving to: {folderName}/characters/
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleChangeFolder}
              disabled={isSelecting}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Change
            </button>
            <button
              onClick={handleClearFolder}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}