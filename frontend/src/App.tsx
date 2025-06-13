import './App.css'
import TabContainer from './components/tabs/TabContainer'
import { SidebarProvider } from './contexts/SidebarContext'
import { StorageProvider } from './contexts/StorageContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { LLMProvider } from './contexts/LLMContext'

function App() {
  return (
    <LLMProvider>
      <StorageProvider>
        <NavigationProvider>
          <SidebarProvider>
            <TabContainer />
          </SidebarProvider>
        </NavigationProvider>
      </StorageProvider>
    </LLMProvider>
  )
}

export default App
