import { X, ChevronDown } from 'lucide-react'
import type { TodoFilters, TodoStatus, Priority } from '../../types'

interface Props {
  filters: TodoFilters
  onChange: (f: Partial<TodoFilters>) => void
  total?: number
}

const STATUSES: { value: TodoStatus | ''; label: string }[] = [
  { value: '', label: 'All' }, { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'DONE', label: 'Done' }
]

const PRIORITIES: { value: Priority | ''; label: string; color?: string }[] = [
  { value: '', label: 'All' },
  { value: 'LOW', label: 'Low', color: '#9ca3af' },
  { value: 'MEDIUM', label: 'Medium', color: '#3b82f6' },
  { value: 'HIGH', label: 'High', color: '#f97316' },
  { value: 'URGENT', label: 'Urgent', color: '#ef4444' }
]

const SORTS = [
  { value: 'order', label: 'Manual' }, { value: 'createdAt', label: 'Created' },
  { value: 'dueDate', label: 'Due Date' }, { value: 'priority', label: 'Priority' }
]

const hasFilters = (f: TodoFilters) => !!(f.status || f.priority || f.search)

export default function FilterBar({ filters, onChange, total }: Props) {
  const pill = (active: boolean, onClick: () => void, children: React.ReactNode, color?: string) => (
    <button onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
        active ? 'border-transparent text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      style={active ? { backgroundColor: color || '#6366f1', borderColor: color || '#6366f1' } : {}}
    >
      {children}
    </button>
  )

  return (
    <div className="px-4 py-3 border-b dark:border-gray-800 space-y-2">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Status */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUSES.map(s => pill(filters.status === s.value, () => onChange({ status: s.value as TodoStatus | '' }), s.label))}
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Priority */}
        <div className="flex items-center gap-1 flex-wrap">
          {PRIORITIES.map(p => pill(filters.priority === p.value, () => onChange({ priority: p.value as Priority | '' }), (
            <span className="flex items-center gap-1">
              {p.color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />}
              {p.label}
            </span>
          ), p.color))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <select value={filters.sort || 'order'} onChange={e => onChange({ sort: e.target.value as TodoFilters['sort'] })}
              className="appearance-none text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-7 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {hasFilters(filters) && (
            <button onClick={() => onChange({ status: '', priority: '', search: '' })}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          {total !== undefined && (
            <span className="text-xs text-gray-400">{total} todos</span>
          )}
        </div>
      </div>
    </div>
  )
}
