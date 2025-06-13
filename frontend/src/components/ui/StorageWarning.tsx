import { useState } from 'react'
import { useStorage } from '../../contexts/StorageContext'

export default function StorageWarning() {
  const { hasStorageFolder, isStorageChecked } = useStorage()
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isStorageChecked || hasStorageFolder || isDismissed) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 max-w-sm bg-yellow-900/90 border border-yellow-600 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-yellow-300">Local Storage Not Configured</h4>
          <p className="text-xs text-yellow-200 mt-1">
            Your data is stored in browser memory. Visit Settings to configure local file storage for better data persistence.
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 text-yellow-400 hover:text-yellow-300 transition-colors"
          aria-label="Dismiss warning"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}