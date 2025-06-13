import { useSidebar } from '../../contexts/SidebarContext'
import { Transition } from '@headlessui/react'

interface SidebarGroupProps {
  title: string
  children: React.ReactNode
}

export default function SidebarGroup({ title, children }: SidebarGroupProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="py-2">
      <Transition
        show={!isCollapsed}
        enter="transition-opacity duration-300 delay-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      </Transition>
      
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}