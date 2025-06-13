import './App.css'
import TabContainer from './components/tabs/TabContainer'
import StoryPrompterPage from './components/pages/StoryPrompterPage'
import CharacterCreatorPage from './components/pages/CharacterCreatorPage'
import { SidebarProvider } from './contexts/SidebarContext'
import { StorageProvider } from './contexts/StorageContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { LLMProvider } from './contexts/LLMContext'

function App() {
  const tabs = [
    {
      label: 'Story Prompter',
      content: <StoryPrompterPage />
    },
    {
      label: 'Character Creator',
      content: <CharacterCreatorPage />
    }
  ]

  return (
    <LLMProvider>
      <StorageProvider>
        <NavigationProvider>
          <SidebarProvider>
            <TabContainer tabs={tabs} />
          </SidebarProvider>
        </NavigationProvider>
      </StorageProvider>
    </LLMProvider>
  )
}

export default App
