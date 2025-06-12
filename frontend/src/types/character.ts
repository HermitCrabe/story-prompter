export interface CharacterTraits {
  [key: string]: string
}

export interface CharacterData {
  Name: string
  "Personal Traits": CharacterTraits
  "Physical Traits": CharacterTraits
}

export interface TraitConfig {
  label: string
  placeholder?: string
  type?: 'text' | 'textarea'
}

export interface CharacterConfig {
  "Personal Traits": Record<string, TraitConfig>
  "Physical Traits": Record<string, TraitConfig>
}