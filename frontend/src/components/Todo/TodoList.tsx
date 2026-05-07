import { useState } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useTodos, useBulkTodos } from '../../hooks/useTodos'
import { todosApi } from '../../api/todos'
import TodoItem from './TodoItem'
import TodoForm from './TodoForm'
import Skeleton from '../ui/Skeleton'
import Button from '../ui/Button'
import type { Todo, TodoFilters } from '../../types'
import { CheckCircle2, Trash2, Archive, ClipboardList } from 'lucide-react'

interface Props {
  filters: TodoFilters
  onNewTodo?: () => void
}

export default function TodoList({ filters, onNewTodo }: Props) {
  const [localTodos, setLocalTodos] = useState<Todo[] | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const bulkMutation = useBulkTodos()

  const { data, isLoading } = useTodos(filters)
  const todos = localTodos ?? data?.todos ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const items = todos
    const oldIdx = items.findIndex(t => t.id === active.id)
    const newIdx = items.findIndex(t => t.id === over.id)
    const reordered = arrayMove(items, oldIdx, newIdx)
    setLocalTodos(reordered)
    await todosApi.reorder(reordered.map((t, i) => ({ id: t.id, order: i + 1 }))).catch(() => setLocalTodos(null))
  }

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })

  const clearSelect = () => setSelectedIds(new Set())
  const selectedArr = Array.from(selectedIds)
  const bulkMode = selectedArr.length > 0

  if (isLoading) return (
    <div className="divide-y dark:divide-gray-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
      ))}
    </div>
  )

  if (todos.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
      <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No todos here</p>
      <p className="text-gray-400 dark:text-gray-600 text-sm mb-4">Create your first todo to get started</p>
      {onNewTodo && <Button variant="secondary" size="sm" onClick={onNewTodo}>+ New Todo</Button>}
    </div>
  )

  return (
    <>
      {/* Bulk action bar */}
      {bulkMode && (
        <div className="flex items-center gap-3 px-4 py-2 bg-pink-50 dark:bg-pink-950/30 border-b border-pink-100 dark:border-gray-800">
          <span className="text-sm font-medium text-pink-700 dark:text-pink-300">{selectedArr.length} selected</span>
          <button onClick={() => { bulkMutation.mutate({ ids: selectedArr, action: 'complete' }); clearSelect() }}
            className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 rounded-lg transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
          </button>
          <button onClick={() => { bulkMutation.mutate({ ids: selectedArr, action: 'archive' }); clearSelect() }}
            className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-lg transition-colors">
            <Archive className="w-3.5 h-3.5" /> Archive
          </button>
          <button onClick={() => { bulkMutation.mutate({ ids: selectedArr, action: 'delete' }); clearSelect() }}
            className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button onClick={clearSelect} className="ml-auto text-sm text-pink-400 hover:text-pink-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div>
            {todos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onEdit={setEditingTodo}
                bulkMode={bulkMode || selectedIds.size > 0}
                selected={selectedIds.has(todo.id)}
                onToggleSelect={toggleSelect} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="p-4 text-center">
          <span className="text-sm text-gray-500">{data.pagination.total} total todos</span>
        </div>
      )}

      <TodoForm isOpen={!!editingTodo} onClose={() => setEditingTodo(null)} todo={editingTodo ?? undefined} />
    </>
  )
}
