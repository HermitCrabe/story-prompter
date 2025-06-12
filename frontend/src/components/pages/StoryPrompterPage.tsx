import StoryInput from '../StoryInput'

export default function StoryPrompterPage() {
  const handleDebugPrint = (text: string) => {
    console.log('Text input contents:', text)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Story Prompter</h2>
      <p className="text-gray-300 mb-6">
        Enter your story prompt below and use the debug button to test your input.
      </p>
      <StoryInput onDebugPrint={handleDebugPrint} />
    </div>
  )
}