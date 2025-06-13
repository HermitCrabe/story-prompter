import { createContext, useContext, useState, type ReactNode } from 'react'

type NavigationState = 'story-prompter' | 'character-creator' | 'settings' | 'story-library'

interface NavigationContextType {
  currentView: NavigationState
  setCurrentView: (view: NavigationState) => void
  goToSettings: () => void
  goToStoryPrompter: () => void
  goToCharacterCreator: () => void
  goToStoryLibrary: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<NavigationState>('story-prompter')

  const goToSettings = () => setCurrentView('settings')
  const goToStoryPrompter = () => setCurrentView('story-prompter')
  const goToCharacterCreator = () => setCurrentView('character-creator')
  const goToStoryLibrary = () => setCurrentView('story-library')

  return (
    <NavigationContext.Provider value={{ 
      currentView, 
      setCurrentView, 
      goToSettings, 
      goToStoryPrompter,
      goToCharacterCreator,
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