import { TabPanel, TabPanels } from '@headlessui/react'
import { type ReactNode } from 'react'

interface TabData {
  content: ReactNode
}

interface MainContentProps {
  tabs: TabData[]
}

export default function MainContent({ tabs }: MainContentProps) {
  return (
    <main className="flex-1 overflow-auto bg-gray-900">
      <TabPanels className="h-full">
        {tabs.map((tab, index) => (
          <TabPanel
            key={index}
            className="h-full p-4 focus:outline-none"
          >
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </main>
  )
}