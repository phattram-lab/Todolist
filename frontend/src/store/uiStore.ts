import { create } from 'zustand'

export type View = 'overview' | 'all' | 'today' | 'upcoming' | 'completed' | 'archived' | `category:${string}`

interface UiState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  activeView: View
  selectedTodoId: string | null
  searchQuery: string
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveView: (view: View) => void
  selectTodo: (id: string | null) => void
  setSearchQuery: (q: string) => void
}

const savedTheme = (localStorage.getItem('todolist_theme') as 'light' | 'dark') || 'light'
if (savedTheme === 'dark') document.documentElement.classList.add('dark')

export const useUiStore = create<UiState>((set, get) => ({
  theme: savedTheme,
  sidebarOpen: true,
  activeView: 'overview',
  selectedTodoId: null,
  searchQuery: '',
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('todolist_theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    set({ theme: next })
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view, selectedTodoId: null }),
  selectTodo: (id) => set({ selectedTodoId: id }),
  setSearchQuery: (q) => set({ searchQuery: q })
}))
