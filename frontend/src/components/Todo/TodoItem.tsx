import { useState } from 'react'
import { GripVertical, Pencil, Trash2, Calendar, AlertCircle } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isToday, isPast } from 'date-fns'
import { useUpdateTodo, useDeleteTodo } from '../../hooks/useTodos'
import { useUiStore } from '../../store/uiStore'
import ConfirmDialog from '../ui/ConfirmDialog'
import type { Todo, Priority } from '../../types'

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: '#9ca3af', MEDIUM: '#3b82f6', HIGH: '#f97316', URGENT: '#ef4444'
}

interface Props {
  todo: Todo
  onEdit: (todo: Todo) => void
  bulkMode: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
}

export default function TodoItem({ todo, onEdit, bulkMode, selected, onToggleSelect }: Props) {
  const { selectTodo, selectedTodoId } = useUiStore()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const [showConfirm, setShowConfirm] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const isDone = todo.status === 'DONE'
  const isOverdue = todo.dueDate && isPast(new Date(todo.dueDate)) && !isDone
  const isTodayDue = todo.dueDate && isToday(new Date(todo.dueDate))
  const isActive = selectedTodoId === todo.id

  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateTodo.mutate({ id: todo.id, status: isDone ? 'TODO' : 'DONE' })
  }

  return (
    <>
      <div ref={setNodeRef} style={style}
        onClick={() => !bulkMode && selectTodo(isActive ? null : todo.id)}
        className={`group flex items-center gap-2 px-4 py-3 border-b dark:border-gray-800 cursor-pointer transition-colors ${
          isActive ? 'bg-pink-50 dark:bg-pink-950/30' : 'hover:bg-pink-50/50 dark:hover:bg-gray-800/50'
        } ${isDone ? 'opacity-60' : ''}`}
      >
        {/* Drag handle */}
        <div {...attributes} {...listeners} onClick={e => e.stopPropagation()}
          className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Bulk checkbox */}
        {bulkMode && (
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect(todo.id)} onClick={e => e.stopPropagation()}
            className="w-4 h-4 rounded border-pink-300 text-pink-500 focus:ring-pink-400 flex-shrink-0" />
        )}

        {/* Priority bar */}
        <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[todo.priority] }} />

        {/* Completion circle */}
        <button onClick={toggleDone}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            isDone ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
          }`}
        >
          {isDone && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {todo.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {todo.category && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: todo.category.color + '22', color: todo.category.color }}>
                {todo.category.name}
              </span>
            )}
            {todo.tags.slice(0, 2).map(tag => (
              <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: tag.color + '22', color: tag.color }}>
                {tag.name}
              </span>
            ))}
            {todo.tags.length > 2 && <span className="text-xs text-gray-400">+{todo.tags.length - 2}</span>}
            {todo.dueDate && (
              <span className={`flex items-center gap-0.5 text-xs ${isOverdue ? 'text-red-500' : isTodayDue ? 'text-orange-500' : 'text-gray-400'}`}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                {isOverdue ? 'Overdue' : format(new Date(todo.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {todo._count && todo._count.subtasks > 0 && todo.subtaskStats && (
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(todo.subtaskStats.completed / todo.subtaskStats.total) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-400">{todo.subtaskStats.completed}/{todo.subtaskStats.total}</span>
            </div>
          )}
          {todo.status === 'IN_PROGRESS' && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">In Progress</span>
          )}
          {isOverdue && !isDone && (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">Overdue</span>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={e => { e.stopPropagation(); onEdit(todo) }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); setShowConfirm(true) }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={() => { deleteTodo.mutate(todo.id); setShowConfirm(false) }}
        title="Delete Todo" message={`Delete "${todo.title}"? This will also delete all subtasks.`}
        confirmLabel="Delete" variant="danger" />
    </>
  )
}
