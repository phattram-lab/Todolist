import { useState } from 'react'
import {
  LayoutDashboard, ListTodo, Sun, Calendar, CheckCircle2, Archive,
  Plus, Trash2, Moon, LogOut, Tag, Folder
} from 'lucide-react'
import { useUiStore, type View } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useCategories, useCreateCategory, useDeleteCategory } from '../../hooks/useCategories'
import { useTags, useCreateTag, useDeleteTag } from '../../hooks/useTags'
import { useStats } from '../../hooks/useStats'
import { authApi } from '../../api/auth'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../ui/ConfirmDialog'

const PRESET_COLORS = ['#f472b6', '#e879f9', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#fb923c']

export default function Sidebar() {
  const { activeView, setActiveView, theme, toggleTheme } = useUiStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { data: catData } = useCategories()
  const { data: tagData } = useTags()
  const { data: stats } = useStats()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()
  const createTag = useCreateTag()
  const deleteTag = useDeleteTag()

  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')
  const [catColor, setCatColor] = useState('#f472b6')
  const [showTagForm, setShowTagForm] = useState(false)
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState('#e879f9')
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null)
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null)

  const handleLogout = async () => {
    await authApi.logout().catch(() => {})
    logout()
    navigate('/login')
  }

  const navItem = (view: View, icon: React.ReactNode, label: string, count?: number) => (
    <button
      key={view}
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        activeView === view
          ? 'bg-pink-200 text-pink-900 shadow-sm'
          : 'text-pink-700 hover:bg-pink-100 hover:text-pink-900'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeView === view ? 'bg-pink-300 text-pink-800' : 'bg-pink-100 text-pink-500'}`}>
          {count}
        </span>
      )}
    </button>
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayCount = stats?.upcomingDue?.filter(t => {
    if (!t.dueDate) return false
    const d = new Date(t.dueDate); d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }).length

  return (
    <aside className="w-64 bg-pink-50 border-r border-pink-200 flex flex-col h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0 border-b border-pink-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <span className="text-pink-900 font-bold text-lg">Todolist</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {/* Main nav */}
        {navItem('overview', <LayoutDashboard className="w-4 h-4" />, 'Overview')}
        {navItem('all', <ListTodo className="w-4 h-4" />, 'All Todos', stats?.total)}
        {navItem('today', <Sun className="w-4 h-4" />, 'Today', todayCount)}
        {navItem('upcoming', <Calendar className="w-4 h-4" />, 'Upcoming')}
        {navItem('completed', <CheckCircle2 className="w-4 h-4" />, 'Completed', stats?.completed)}
        {navItem('archived', <Archive className="w-4 h-4" />, 'Archived')}

        {/* Categories */}
        <div className="pt-5">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Categories</span>
            <button onClick={() => setShowCatForm(!showCatForm)} className="text-pink-400 hover:text-pink-600 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {showCatForm && (
            <div className="mx-1 mb-2 p-3 bg-pink-100 rounded-xl space-y-2 border border-pink-200">
              <input
                value={catName} onChange={e => setCatName(e.target.value)}
                placeholder="Category name"
                onKeyDown={e => e.key === 'Enter' && catName.trim() && (createCategory.mutate({ name: catName.trim(), color: catColor }), setCatName(''), setShowCatForm(false))}
                className="w-full text-sm bg-white text-pink-900 placeholder-pink-300 border border-pink-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
                autoFocus
              />
              <div className="flex gap-1 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setCatColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${catColor === c ? 'border-pink-600 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (catName.trim()) { createCategory.mutate({ name: catName.trim(), color: catColor }); setCatName(''); setShowCatForm(false) } }}
                  className="text-xs text-white bg-pink-500 hover:bg-pink-600 px-2 py-1 rounded-lg transition-colors">Add</button>
                <button onClick={() => setShowCatForm(false)} className="text-xs text-pink-500 hover:text-pink-700 px-2 py-1 rounded-lg transition-colors">Cancel</button>
              </div>
            </div>
          )}
          {catData?.categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveView(`category:${cat.id}`)}
              className={`group flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${
                activeView === `category:${cat.id}` ? 'bg-pink-200 text-pink-900' : 'text-pink-700 hover:bg-pink-100 hover:text-pink-900'
              }`}
            >
              <Folder className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cat.color }} />
              <span className="flex-1 text-left truncate">{cat.name}</span>
              <span className="text-xs text-pink-400">{cat._count?.todos || 0}</span>
              <button onClick={e => { e.stopPropagation(); setDeleteCatId(cat.id) }}
                className="opacity-0 group-hover:opacity-100 ml-1 text-pink-300 hover:text-red-400 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="pt-3 pb-4">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Tags</span>
            <button onClick={() => setShowTagForm(!showTagForm)} className="text-pink-400 hover:text-pink-600 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {showTagForm && (
            <div className="mx-1 mb-2 p-3 bg-pink-100 rounded-xl space-y-2 border border-pink-200">
              <input value={tagName} onChange={e => setTagName(e.target.value)} placeholder="Tag name"
                onKeyDown={e => e.key === 'Enter' && tagName.trim() && (createTag.mutate({ name: tagName.trim(), color: tagColor }), setTagName(''), setShowTagForm(false))}
                className="w-full text-sm bg-white text-pink-900 placeholder-pink-300 border border-pink-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
                autoFocus />
              <div className="flex gap-1 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setTagColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${tagColor === c ? 'border-pink-600 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (tagName.trim()) { createTag.mutate({ name: tagName.trim(), color: tagColor }); setTagName(''); setShowTagForm(false) } }}
                  className="text-xs text-white bg-pink-500 hover:bg-pink-600 px-2 py-1 rounded-lg transition-colors">Add</button>
                <button onClick={() => setShowTagForm(false)} className="text-xs text-pink-500 hover:text-pink-700 px-2 py-1 rounded-lg transition-colors">Cancel</button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 px-3">
            {tagData?.tags.map(tag => (
              <span key={tag.id} className="group relative inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full cursor-pointer"
                style={{ backgroundColor: tag.color + '33', color: tag.color }}>
                <Tag className="w-2.5 h-2.5" />
                {tag.name}
                <button onClick={() => setDeleteTagId(tag.id)} className="opacity-0 group-hover:opacity-100 ml-0.5 transition-opacity">
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-pink-200 flex-shrink-0 space-y-0.5">
        <button onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-pink-700 hover:bg-pink-100 hover:text-pink-900 transition-colors">
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-pink-700 truncate flex-1">{user?.username}</span>
          <button onClick={handleLogout} className="text-pink-400 hover:text-pink-700 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog isOpen={!!deleteCatId} onClose={() => setDeleteCatId(null)}
        onConfirm={() => { if (deleteCatId) { deleteCategory.mutate(deleteCatId); setDeleteCatId(null) } }}
        title="Delete Category" message="Delete this category? Todos will keep their data but lose this category."
        confirmLabel="Delete" variant="danger" />
      <ConfirmDialog isOpen={!!deleteTagId} onClose={() => setDeleteTagId(null)}
        onConfirm={() => { if (deleteTagId) { deleteTag.mutate(deleteTagId); setDeleteTagId(null) } }}
        title="Delete Tag" message="Delete this tag?" confirmLabel="Delete" variant="danger" />
    </aside>
  )
}
