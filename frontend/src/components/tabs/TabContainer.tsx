import { TabGroup } from '@headlessui/react'
import { type ReactNode, useEffect, useState } from 'react'
import Header from '../layout/Header'
import MainContent from '../layout/MainContent'
import Sidebar from '../sidebar/Sidebar'
import StorageWarning from '../ui/StorageWarning'
import SettingsPage from '../pages/SettingsPage'
import StoryLibraryPage from '../pages/StoryLibraryPage'
import { useSidebar } from '../../contexts/SidebarContext'
import { useNavigation } from '../../contexts/NavigationContext'

interface TabData {
  label: string
  content: ReactNode
}

interface TabContainerProps {
  tabs: TabData[]
  defaultIndex?: number
}

function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowWidth
}

export default function TabContainer({ tabs, defaultIndex = 0 }: TabContainerProps) {
  const { isCollapsed } = useSidebar()
  const { currentView } = useNavigation()
  const windowWidth = useWindowWidth()
  const isDesktop = windowWidth >= 1024

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: isDesktop ? (isCollapsed ? '4rem' : '16rem') : '0'
        }}
      >
        {currentView === 'settings' ? (
          <div className="flex-1 p-4">
            <SettingsPage />
          </div>
        ) : currentView === 'story-library' ? (
          <div className="flex-1 p-4">
            <StoryLibraryPage />
          </div>
        ) : (
          <TabGroup defaultIndex={defaultIndex}>
            <Header tabs={tabs} />
            <MainContent tabs={tabs} />
          </TabGroup>
        )}
      </div>
      
      <StorageWarning />
    </div>
  )
}