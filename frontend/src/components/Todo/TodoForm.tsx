import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useCreateTodo, useUpdateTodo } from '../../hooks/useTodos'
import { useCategories } from '../../hooks/useCategories'
import { useTags } from '../../hooks/useTags'
import type { Todo, Priority, TodoStatus } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  todo?: Todo
  parentId?: string
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: '#6b7280' },
  { value: 'MEDIUM', label: 'Medium', color: '#3b82f6' },
  { value: 'HIGH', label: 'High', color: '#f97316' },
  { value: 'URGENT', label: 'Urgent', color: '#ef4444' }
]

const STATUSES: { value: TodoStatus; label: string }[] = [
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' }
]

export default function TodoForm({ isOpen, onClose, todo, parentId }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [status, setStatus] = useState<TodoStatus>('TODO')
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const { data: catData } = useCategories()
  const { data: tagData } = useTags()
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()

  useEffect(() => {
    if (todo) {
      setTitle(todo.title)
      setDescription(todo.description || '')
      setPriority(todo.priority)
      setStatus(todo.status)
      setDueDate(todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd'T'HH:mm") : '')
      setCategoryId(todo.category?.id || '')
      setSelectedTagIds(todo.tags.map(t => t.id))
    } else {
      setTitle(''); setDescription(''); setPriority('MEDIUM'); setStatus('TODO')
      setDueDate(''); setCategoryId(''); setSelectedTagIds([])
    }
  }, [todo, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const payload = {
      title: title.trim(), description: description.trim() || undefined,
      priority, status, dueDate: dueDate || undefined,
      categoryId: categoryId || undefined, tagIds: selectedTagIds,
      ...(parentId ? { parentId } : {})
    }
    if (todo) {
      await updateTodo.mutateAsync({ id: todo.id, ...payload })
    } else {
      await createTodo.mutateAsync(payload)
    }
    onClose()
  }

  const toggleTag = (id: string) =>
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const loading = createTodo.isPending || updateTodo.isPending

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={todo ? 'Edit Todo' : 'New Todo'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Title */}
        <div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" required
            className="w-full text-lg font-medium bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-pink-400 dark:focus:border-pink-300 outline-none pb-2 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add description (optional)…" rows={3}
            className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 dark:text-white placeholder-gray-400 resize-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Priority</label>
            <div className="flex gap-1">
              {PRIORITIES.map(p => (
                <button type="button" key={p.value} onClick={() => setPriority(p.value)}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border-2 transition-colors ${priority === p.value ? 'border-current text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                  style={priority === p.value ? { backgroundColor: p.color, borderColor: p.color } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Status</label>
            <div className="flex gap-1">
              {STATUSES.map(s => (
                <button type="button" key={s.value} onClick={() => setStatus(s.value)}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border-2 transition-colors ${
                    status === s.value ? 'border-pink-400 bg-pink-400 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-pink-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Due date */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Due Date</label>
            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 dark:text-white transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 dark:text-white transition-colors">
              <option value="">No category</option>
              {catData?.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Tags */}
        {tagData?.tags && tagData.tags.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tagData.tags.map(tag => (
                <button type="button" key={tag.id} onClick={() => toggleTag(tag.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${selectedTagIds.includes(tag.id) ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                  style={selectedTagIds.includes(tag.id) ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{todo ? 'Save Changes' : 'Create Todo'}</Button>
        </div>
      </form>
    </Modal>
  )
}
