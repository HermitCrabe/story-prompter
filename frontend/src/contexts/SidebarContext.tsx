import { createContext, useContext, useState, type ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
  expandSidebar: () => void
  collapseSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev)
  }

  const expandSidebar = () => {
    setIsCollapsed(false)
  }

  const collapseSidebar = () => {
    setIsCollapsed(true)
  }

  const value: SidebarContextType = {
    isCollapsed,
    toggleSidebar,
    expandSidebar,
    collapseSidebar
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}