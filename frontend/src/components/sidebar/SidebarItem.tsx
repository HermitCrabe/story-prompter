import { useSidebar } from '../../contexts/SidebarContext'
import { Transition } from '@headlessui/react'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  isActive?: boolean
  badge?: string | number
}

export default function SidebarItem({ 
  icon, 
  label, 
  onClick, 
  isActive = false,
  badge 
}: SidebarItemProps) {
  const { isCollapsed } = useSidebar()

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-3 text-left transition-colors duration-200 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${
        isActive ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:text-white'
      }`}
      title={isCollapsed ? label : undefined}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
        {icon}
      </div>

      {/* Label with transition */}
      <Transition
        show={!isCollapsed}
        enter="transition-opacity duration-300 delay-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex items-center justify-between flex-1 whitespace-nowrap">
          <span className="font-medium">{label}</span>
          {badge && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </Transition>
    </button>
  )
}