import './App.css'
import TabContainer from './components/tabs/TabContainer'
import StoryPrompterPage from './components/pages/StoryPrompterPage'
import CharacterCreatorPage from './components/pages/CharacterCreatorPage'

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

  return <TabContainer tabs={tabs} />
}

export default App
