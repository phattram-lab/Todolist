import { useRef, useEffect } from 'react'
import { Plus, Search, Menu } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import type { View } from '../../store/uiStore'

const VIEW_LABELS: Record<string, string> = {
  overview: 'Overview', all: 'All Todos', today: 'Today',
  upcoming: 'Upcoming', completed: 'Completed', archived: 'Archived'
}

interface Props {
  onNewTodo: () => void
}

export default function Header({ onNewTodo }: Props) {
  const { activeView, searchQuery, setSearchQuery, setSidebarOpen } = useUiStore()
  const searchRef = useRef<HTMLInputElement>(null)

  const label = activeView.startsWith('category:')
    ? 'Category'
    : (VIEW_LABELS[activeView as View] || activeView)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <header className="h-14 border-b border-pink-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-4 gap-4 flex-shrink-0">
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
        <Menu className="w-5 h-5" />
      </button>
      <h1 className="font-semibold text-pink-900 dark:text-white text-base flex-shrink-0">{label}</h1>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={searchRef}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search todos… (/)"
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-pink-100 dark:bg-gray-800 border border-pink-200 dark:border-gray-700 focus:border-pink-400 focus:bg-white dark:focus:bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 text-gray-900 dark:text-white placeholder-pink-300 dark:placeholder-gray-500 transition-colors"
        />
      </div>

      <div className="ml-auto">
        <button onClick={onNewTodo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-pink-200">
          <Plus className="w-4 h-4" />
          New Todo
        </button>
      </div>
    </header>
  )
}
