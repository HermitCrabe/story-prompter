// JSON Schema for structured story outline output
export const storyOutlineSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "The title of the story"
    },
    summary: {
      type: "string",
      description: "A brief summary of the story"
    },
    characters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Character name"
          },
          role: {
            type: "string", 
            description: "Character's role in the story (protagonist, antagonist, supporting, etc.)"
          },
          description: {
            type: "string",
            description: "Brief character description"
          }
        },
        required: ["name", "role", "description"],
        additionalProperties: false
      },
      description: "List of main characters"
    },
    outline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: {
            type: "string",
            description: "Section title (e.g., 'Chapter 1', 'Act I', 'Opening')"
          },
          description: {
            type: "string",
            description: "Detailed description of what happens in this section"
          },
          scenes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scene_title: {
                  type: "string",
                  description: "Brief title for the scene"
                },
                scene_description: {
                  type: "string", 
                  description: "Detailed description of the scene"
                },
                characters_involved: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Names of characters involved in this scene"
                }
              },
              required: ["scene_title", "scene_description", "characters_involved"],
              additionalProperties: false
            },
            description: "Individual scenes within this section"
          }
        },
        required: ["section", "description", "scenes"],
        additionalProperties: false
      },
      description: "Structured outline broken down by sections and scenes"
    },
    themes: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Main themes explored in the story"
    },
    genre: {
      type: "string",
      description: "Primary genre of the story"
    }
  },
  required: ["title", "summary", "characters", "outline", "themes", "genre"],
  additionalProperties: false
}

// Type definition that matches the schema
export interface StructuredStoryOutline {
  title: string
  summary: string
  characters: Array<{
    name: string
    role: string
    description: string
  }>
  outline: Array<{
    section: string
    description: string
    scenes: Array<{
      scene_title: string
      scene_description: string
      characters_involved: string[]
    }>
  }>
  themes: string[]
  genre: string
}