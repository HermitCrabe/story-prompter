import { createContext, useContext, useState, type ReactNode } from 'react'

type NavigationState = 'tabs' | 'settings' | 'story-library'

interface NavigationContextType {
  currentView: NavigationState
  setCurrentView: (view: NavigationState) => void
  goToSettings: () => void
  goToTabs: () => void
  goToStoryLibrary: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<NavigationState>('tabs')

  const goToSettings = () => setCurrentView('settings')
  const goToTabs = () => setCurrentView('tabs')
  const goToStoryLibrary = () => setCurrentView('story-library')

  return (
    <NavigationContext.Provider value={{ 
      currentView, 
      setCurrentView, 
      goToSettings, 
      goToTabs,
      goToStoryLibrary
    }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}