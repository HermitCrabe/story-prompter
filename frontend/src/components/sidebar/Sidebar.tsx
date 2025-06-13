import { Transition } from '@headlessui/react'
import { useSidebar } from '../../contexts/SidebarContext'
import SidebarContent from './SidebarContent'

interface SidebarProps {
  children?: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  const { isCollapsed, toggleSidebar, collapseSidebar } = useSidebar()

  return (
    <>
      {/* Sidebar */}
      <Transition
        as="div"
        show={true}
        className="fixed left-0 top-0 h-full z-40 bg-gray-800 border-r border-gray-700 flex flex-col"
        enter="transition-all duration-300 ease-out"
        enterFrom="w-16"
        enterTo={isCollapsed ? "w-16" : "w-64"}
        leave="transition-all duration-300 ease-in"
        leaveFrom={isCollapsed ? "w-64" : "w-16"}
        leaveTo={isCollapsed ? "w-16" : "w-64"}
        style={{
          width: isCollapsed ? '4rem' : '16rem',
          transition: 'width 300ms ease-in-out'
        }}
      >
        {/* Sidebar Header with Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Transition
            as="div"
            show={!isCollapsed}
            enter="transition-opacity duration-300 delay-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <h2 className="text-white font-semibold text-lg whitespace-nowrap">
              Navigation
            </h2>
          </Transition>
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300 hover:text-white transition-colors duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {children || <SidebarContent />}
        </div>
      </Transition>

      {/* Mobile Overlay */}
      <Transition
        as="div"
        show={!isCollapsed}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        onClick={collapseSidebar}
      />
    </>
  )
}