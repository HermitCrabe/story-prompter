import { useState } from 'react'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react'
import StorySelector from '../story/StorySelector'
import StorySetupTab from '../story/StorySetupTab'
import StoryOutlineTab from '../story/StoryOutlineTab'

export default function StoryLibraryPage() {
  const [selectedStory, setSelectedStory] = useState<string | null>(null)

  const tabs = [
    { name: 'Setup', id: 'setup' },
    { name: 'Outline', id: 'outline' }
  ]

  // If no story is selected, show the story selection view
  if (!selectedStory) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Story Library</h2>
          <p className="text-gray-300">
            Select and manage your stories. Configure characters, plot points, and track your progress.
          </p>
        </div>

        <StorySelector 
          selectedStory={selectedStory} 
          onStorySelect={setSelectedStory} 
        />
      </div>
    )
  }

  // If a story is selected, show the tabbed story editing view
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header with Back Button */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedStory(null)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Stories</span>
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <h1 className="text-xl font-semibold text-white">Story Workspace</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabGroup>
        <div className="bg-gray-800 border-b border-gray-700">
          <TabList className="flex px-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    selected
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </TabList>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <TabPanels className="h-full">
            <TabPanel className="p-6">
              <StorySetupTab storyId={selectedStory} />
            </TabPanel>
            
            <TabPanel className="p-6">
              <StoryOutlineTab storyId={selectedStory} />
            </TabPanel>
          </TabPanels>
        </div>
      </TabGroup>
    </div>
  )
}