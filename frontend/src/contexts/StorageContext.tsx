import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { isFileSystemSupported, getStorageFolder } from '../utils/fileSystemStorage'

interface StorageContextType {
  hasStorageFolder: boolean
  setHasStorageFolder: (hasFolder: boolean) => void
  isStorageChecked: boolean
}

const StorageContext = createContext<StorageContextType | undefined>(undefined)

export function StorageProvider({ children }: { children: ReactNode }) {
  const [hasStorageFolder, setHasStorageFolder] = useState(false)
  const [isStorageChecked, setIsStorageChecked] = useState(false)

  useEffect(() => {
    const checkExistingFolder = async () => {
      if (isFileSystemSupported()) {
        try {
          const handle = await getStorageFolder()
          setHasStorageFolder(!!handle)
        } catch (error) {
          console.error('Failed to check existing folder:', error)
          setHasStorageFolder(false)
        }
      }
      setIsStorageChecked(true)
    }

    checkExistingFolder()
  }, [])

  return (
    <StorageContext.Provider value={{ hasStorageFolder, setHasStorageFolder, isStorageChecked }}>
      {children}
    </StorageContext.Provider>
  )
}

export function useStorage() {
  const context = useContext(StorageContext)
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider')
  }
  return context
}