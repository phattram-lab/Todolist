import { useState } from 'react'
import FilterBar from './FilterBar'
import TodoList from './TodoList'
import { useTodos } from '../../hooks/useTodos'
import { useUiStore } from '../../store/uiStore'
import { useCategories } from '../../hooks/useCategories'
import type { TodoFilters, TodoStatus } from '../../types'

interface Props {
  onNewTodo: () => void
}

export default function TodosView({ onNewTodo }: Props) {
  const { activeView, searchQuery } = useUiStore()
  const { data: catData } = useCategories()
  const [filters, setFilters] = useState<TodoFilters>({ sort: 'order', order: 'asc' })

  const mergedFilters: TodoFilters = { ...filters, search: searchQuery || undefined }

  // Derive filters from the active view
  if (activeView === 'completed') mergedFilters.status = 'DONE'
  else if (activeView === 'archived') mergedFilters.status = 'ARCHIVED'
  else if (activeView === 'today') {
    mergedFilters.sort = 'dueDate'
    // handled visually; we can't do date-range filtering from the server easily here
  } else if (activeView.startsWith('category:')) {
    const catId = activeView.replace('category:', '')
    mergedFilters.categoryId = catId
  }

  if (activeView !== 'completed' && activeView !== 'archived' && !filters.status) {
    mergedFilters.status = ''
  }

  const { data } = useTodos(mergedFilters)

  return (
    <div className="flex flex-col h-full">
      {activeView !== 'completed' && activeView !== 'archived' && (
        <FilterBar filters={filters} onChange={f => setFilters(prev => ({ ...prev, ...f }))} total={data?.pagination.total} />
      )}
      <div className="flex-1 overflow-y-auto">
        <TodoList filters={mergedFilters} onNewTodo={onNewTodo} />
      </div>
    </div>
  )
}
