import { type ReactNode, useEffect, useState } from 'react'
import Sidebar from '../sidebar/Sidebar'
import StorageWarning from '../ui/StorageWarning'
import SettingsPage from '../pages/SettingsPage'
import StoryLibraryPage from '../pages/StoryLibraryPage'
import StoryPrompterPage from '../pages/StoryPrompterPage'
import CharacterCreatorPage from '../pages/CharacterCreatorPage'
import { useSidebar } from '../../contexts/SidebarContext'
import { useNavigation } from '../../contexts/NavigationContext'

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

export default function TabContainer() {
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
        ) : currentView === 'story-prompter' ? (
          <div className="flex-1 p-4">
            <StoryPrompterPage />
          </div>
        ) : currentView === 'character-creator' ? (
          <div className="flex-1 p-4">
            <CharacterCreatorPage />
          </div>
        ) : null}
      </div>
      
      <StorageWarning />
    </div>
  )
}