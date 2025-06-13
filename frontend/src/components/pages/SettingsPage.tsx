import FolderSelector from '../storage/FolderSelector'
import LLMSettings from '../settings/LLMSettings'
import { useStorage } from '../../contexts/StorageContext'

export default function SettingsPage() {
  const { hasStorageFolder, setHasStorageFolder } = useStorage()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="text-gray-300">
          Configure your application preferences and storage options.
        </p>
      </div>

      <div className="space-y-6">
        {/* Storage Configuration Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Local File Storage</h3>
          <p className="text-gray-300 mb-4">
            Configure a local folder to save your characters and stories as files on your computer.
            This provides better data persistence and allows you to backup your work.
          </p>
          
          <FolderSelector onFolderChange={setHasStorageFolder} />
        </div>

        {/* LLM API Configuration */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">LLM API Configuration</h3>
          <p className="text-gray-300 mb-4">
            Configure your OpenAI-compatible LLM endpoint for story generation and character interactions.
          </p>
          
          <LLMSettings />
        </div>

        {/* Future Settings Sections */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Application Preferences</h3>
          <p className="text-gray-400 text-sm">
            Additional settings will be available in future updates.
          </p>
        </div>
      </div>
    </div>
  )
}