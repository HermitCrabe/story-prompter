// JSON Schema for custom story outline format
export const customOutlineSchema = {
  type: "object",
  patternProperties: {
    "^.+$": {  // Any property name (chapter name)
      type: "object",
      properties: {
        actions: {
          type: "array",
          items: {
            type: "string"
          },
          description: "List of story actions that occur in this chapter"
        },
        eroticism_level: {
          type: "string",
          enum: ["low", "med", "high"],
          description: "Level of erotic content in this chapter"
        }
      },
      required: ["actions", "eroticism_level"],
      additionalProperties: false
    }
  },
  additionalProperties: false,
  description: "Story outline with chapters as keys, each containing actions and eroticism level"
}

// Type definition that matches the schema
export interface CustomOutlineFormat {
  [chapterName: string]: {
    actions: string[]
    eroticism_level: "low" | "med" | "high"
  }
}