import { useState, useEffect } from 'react'
import { useUiStore } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import Sidebar from '../components/Layout/Sidebar'
import Header from '../components/Layout/Header'
import StatsOverview from '../components/Stats/StatsOverview'
import TodosView from '../components/Todo/TodosView'
import TodoDetail from '../components/Todo/TodoDetail'
import TodoForm from '../components/Todo/TodoForm'

export default function DashboardPage() {
  const { activeView, selectedTodoId, selectTodo } = useUiStore()
  const { setUser } = useAuthStore()
  const [showNewTodo, setShowNewTodo] = useState(false)

  useEffect(() => {
    authApi.getMe().then(({ user }) => setUser(user)).catch(() => {})
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setShowNewTodo(true) }
      if (e.key === 'Escape') { selectTodo(null); setShowNewTodo(false) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const isOverview = activeView === 'overview'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onNewTodo={() => setShowNewTodo(true)} />

        <main className="flex-1 overflow-hidden flex">
          <div className={`flex-1 overflow-auto ${selectedTodoId ? 'hidden lg:block' : ''}`}>
            {isOverview ? (
              <StatsOverview />
            ) : (
              <TodosView onNewTodo={() => setShowNewTodo(true)} />
            )}
          </div>

          {selectedTodoId && <TodoDetail />}
        </main>
      </div>

      <TodoForm isOpen={showNewTodo} onClose={() => setShowNewTodo(false)} />
    </div>
  )
}
