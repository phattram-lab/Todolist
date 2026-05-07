import { useState, useEffect } from 'react'
import { X, Calendar, Tag, Folder, Trash2, Plus, Check } from 'lucide-react'
import { format } from 'date-fns'
import { useUiStore } from '../../store/uiStore'
import { useTodo, useUpdateTodo, useDeleteTodo, useCreateTodo } from '../../hooks/useTodos'
import { useCategories } from '../../hooks/useCategories'
import { useTags } from '../../hooks/useTags'
import ConfirmDialog from '../ui/ConfirmDialog'
import type { Priority, TodoStatus } from '../../types'

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: '#9ca3af', MEDIUM: '#3b82f6', HIGH: '#f97316', URGENT: '#ef4444'
}

const STATUS_LABELS: Record<TodoStatus, string> = {
  TODO: 'Todo', IN_PROGRESS: 'In Progress', DONE: 'Done', ARCHIVED: 'Archived'
}

export default function TodoDetail() {
  const { selectedTodoId, selectTodo } = useUiStore()
  const { data, isLoading } = useTodo(selectedTodoId)
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const createTodo = useCreateTodo()
  const { data: catData } = useCategories()
  const { data: tagData } = useTags()

  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [descVal, setDescVal] = useState('')
  const [subtaskInput, setSubtaskInput] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const todo = data?.todo

  useEffect(() => {
    if (todo) { setTitleVal(todo.title); setDescVal(todo.description || '') }
  }, [todo])

  if (!selectedTodoId) return null

  const update = (payload: Record<string, any>) => updateTodo.mutate({ id: selectedTodoId, ...payload })

  const saveTitle = () => { if (titleVal.trim() && titleVal !== todo?.title) update({ title: titleVal.trim() }); setEditingTitle(false) }
  const saveDesc = () => { if (descVal !== todo?.description) update({ description: descVal }); setEditingDesc(false) }

  const addSubtask = () => {
    if (!subtaskInput.trim()) return
    createTodo.mutate({ title: subtaskInput.trim(), parentId: selectedTodoId, priority: 'MEDIUM' })
    setSubtaskInput('')
  }

  const toggleTag = (tagId: string) => {
    if (!todo) return
    const ids = todo.tags.map(t => t.id)
    update({ tagIds: ids.includes(tagId) ? ids.filter(id => id !== tagId) : [...ids, tagId] })
  }

  return (
    <aside className="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-screen overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-800 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Detail</span>
        <button onClick={() => selectTodo(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading || !todo ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Title */}
            {editingTitle ? (
              <input value={titleVal} onChange={e => setTitleVal(e.target.value)} onBlur={saveTitle}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
                className="w-full text-base font-semibold bg-transparent border-b-2 border-pink-400 outline-none text-gray-900 dark:text-white pb-1"
                autoFocus />
            ) : (
              <h2 onClick={() => setEditingTitle(true)}
                className={`text-base font-semibold cursor-text hover:text-pink-500 dark:hover:text-pink-300 transition-colors ${
                  todo.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'
                }`}>
                {todo.title}
              </h2>
            )}

            {/* Status buttons */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Status</p>
              <div className="flex gap-1.5 flex-wrap">
                {(['TODO', 'IN_PROGRESS', 'DONE'] as TodoStatus[]).map(s => (
                  <button key={s} onClick={() => update({ status: s })}
                    className={`text-xs px-3 py-1.5 rounded-lg border-2 font-medium transition-all ${
                      todo.status === s ? 'border-pink-400 bg-pink-400 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-pink-200'
                    }`}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Priority</p>
              <div className="flex gap-1.5">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map(p => (
                  <button key={p} onClick={() => update({ priority: p })}
                    className={`text-xs px-3 py-1.5 rounded-lg border-2 font-medium transition-all capitalize ${
                      todo.priority === p ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    style={todo.priority === p ? { backgroundColor: PRIORITY_COLORS[p] } : {}}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Due Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input type="datetime-local" defaultValue={todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={e => update({ dueDate: e.target.value || null })}
                  className="text-sm bg-transparent border-0 outline-none text-gray-700 dark:text-gray-300 cursor-pointer" />
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Category</p>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-gray-400" />
                <select value={todo.category?.id || ''} onChange={e => update({ categoryId: e.target.value || null })}
                  className="text-sm bg-transparent border-0 outline-none text-gray-700 dark:text-gray-300 cursor-pointer">
                  <option value="">No category</option>
                  {catData?.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tags</p>
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {tagData?.tags.map(tag => {
                  const active = todo.tags.some(t => t.id === tag.id)
                  return (
                    <button key={tag.id} onClick={() => toggleTag(tag.id)}
                      className={`text-xs px-2 py-1 rounded-full border transition-all ${active ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                      style={active ? { backgroundColor: tag.color, borderColor: tag.color } : {}}>
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Notes</p>
              {editingDesc ? (
                <textarea value={descVal} onChange={e => setDescVal(e.target.value)} onBlur={saveDesc} rows={4} autoFocus
                  className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-pink-400 rounded-lg px-3 py-2 outline-none text-gray-900 dark:text-white resize-none"
                />
              ) : (
                <div onClick={() => setEditingDesc(true)}
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-text hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 min-h-[60px] transition-colors">
                  {todo.description || <span className="text-gray-400 dark:text-gray-600">Add notes…</span>}
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Subtasks {todo.subtasks && todo.subtasks.length > 0 && (
                  <span className="ml-1 text-pink-400">{todo.subtasks.filter(s => s.status === 'DONE').length}/{todo.subtasks.length}</span>
                )}
              </p>
              {todo.subtasks && todo.subtasks.length > 0 && (
                <>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
                    <div className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(todo.subtasks.filter(s => s.status === 'DONE').length / todo.subtasks.length) * 100}%` }} />
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {todo.subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center gap-2">
                        <button onClick={() => updateTodo.mutate({ id: sub.id, status: sub.status === 'DONE' ? 'TODO' : 'DONE' })}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            sub.status === 'DONE' ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          {sub.status === 'DONE' && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </button>
                        <span className={`text-sm ${sub.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <input value={subtaskInput} onChange={e => setSubtaskInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                  placeholder="Add subtask…"
                  className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 dark:text-white placeholder-gray-400" />
                <button onClick={addSubtask} className="p-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-400 dark:text-gray-600 space-y-1 pt-2 border-t dark:border-gray-800">
              <p>Created {format(new Date(todo.createdAt), 'MMM d, yyyy HH:mm')}</p>
              <p>Updated {format(new Date(todo.updatedAt), 'MMM d, yyyy HH:mm')}</p>
              {todo.completedAt && <p className="text-green-500">Completed {format(new Date(todo.completedAt), 'MMM d, yyyy HH:mm')}</p>}
            </div>

            {/* Delete */}
            <button onClick={() => setShowConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900">
              <Trash2 className="w-4 h-4" /> Delete Todo
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={() => { deleteTodo.mutate(selectedTodoId); selectTodo(null); setShowConfirm(false) }}
        title="Delete Todo" message="Delete this todo and all its subtasks?" confirmLabel="Delete" variant="danger" />
    </aside>
  )
}
