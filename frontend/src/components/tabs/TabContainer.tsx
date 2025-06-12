import { TabGroup } from '@headlessui/react'
import { type ReactNode } from 'react'
import Header from '../layout/Header'
import MainContent from '../layout/MainContent'

interface TabData {
  label: string
  content: ReactNode
}

interface TabContainerProps {
  tabs: TabData[]
  defaultIndex?: number
}

export default function TabContainer({ tabs, defaultIndex = 0 }: TabContainerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TabGroup defaultIndex={defaultIndex}>
        <Header tabs={tabs} />
        <MainContent tabs={tabs} />
      </TabGroup>
    </div>
  )
}