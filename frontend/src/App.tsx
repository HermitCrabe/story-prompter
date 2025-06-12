import './App.css'
import StoryInput from './components/StoryInput'

function App() {
  const handleDebugPrint = (text: string) => {
    console.log('Text input contents:', text)
  }

  return (
    <>
      <h1>Story Prompter</h1>
      <StoryInput onDebugPrint={handleDebugPrint} />
    </>
  )
}

export default App
