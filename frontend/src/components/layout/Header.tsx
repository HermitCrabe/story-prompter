import { Tab, TabList } from '@headlessui/react'

interface TabData {
  label: string
}

interface HeaderProps {
  tabs: TabData[]
}

export default function Header({ tabs }: HeaderProps) {
  return (
    <header className="w-full bg-gray-900 border-b border-gray-700">
      <div className="flex items-end h-14">
        <div className="flex items-center px-4 py-3">
          <h1 className="text-sm font-medium text-gray-200 mr-6 tracking-wide">Story Prompter</h1>
        </div>
        <TabList className="flex">
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `px-4 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg mr-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                 ${
                   selected
                     ? 'bg-gray-800 text-white border-t-2 border-x-2 border-blue-500 border-b-0'
                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
                 }`
              }
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <div className="flex-1 border-b border-gray-700"></div>
      </div>
    </header>
  )
}