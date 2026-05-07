import { ListTodo, CheckCircle2, Clock, AlertTriangle, Flame, TrendingUp } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { useStats } from '../../hooks/useStats'
import Skeleton from '../ui/Skeleton'
import type { Priority } from '../../types'

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: '#9ca3af', MEDIUM: '#3b82f6', HIGH: '#f97316', URGENT: '#ef4444'
}

function StatCard({ icon, label, value, sub, danger }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; danger?: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border ${danger && Number(value) > 0 ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-800'}`}>
      <div className={`inline-flex p-2 rounded-xl mb-3 ${danger && Number(value) > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-pink-50 dark:bg-pink-950/30 text-pink-500 dark:text-pink-300'}`}>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${danger && Number(value) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{value}</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useStats()

  if (isLoading || !stats) return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
  )

  const maxActivity = Math.max(...stats.recentActivity.map(d => Math.max(d.completed, d.created)), 1)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<ListTodo className="w-5 h-5" />} label="Total Todos" value={stats.total} />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completed" value={stats.completed} sub={`${stats.completionRate}% rate`} />
        <StatCard icon={<Clock className="w-5 h-5" />} label="In Progress" value={stats.inProgress} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Overdue" value={stats.overdue} danger />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion rate */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
          <TrendingUp className="w-5 h-5 text-pink-400 mb-2" />
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ec4899" strokeWidth="2.5"
                strokeDasharray={`${stats.completionRate} ${100 - stats.completionRate}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Completion Rate</p>
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500 mb-2" />
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{stats.streak}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Day Streak</p>
          <p className="text-xs text-gray-400 mt-1">{stats.streak > 0 ? 'Keep it up! 🎉' : 'Complete a todo today!'}</p>
        </div>

        {/* Priority breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">By Priority</p>
          <div className="space-y-3">
            {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => {
              const count = stats.byPriority[p] || 0
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
              return (
                <div key={p}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: PRIORITY_COLORS[p] }}>{p.charAt(0) + p.slice(1).toLowerCase()}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: PRIORITY_COLORS[p] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Activity chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Last 7 Days</p>
          <div className="flex items-end gap-2 h-32">
            {stats.recentActivity.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="flex gap-0.5 items-end w-full">
                  <div className="flex-1 bg-pink-300 dark:bg-pink-700 rounded-t transition-all"
                    style={{ height: `${(day.created / maxActivity) * 100}%`, minHeight: day.created > 0 ? '4px' : '0' }} title={`Created: ${day.created}`} />
                  <div className="flex-1 bg-green-400 dark:bg-green-600 rounded-t transition-all"
                    style={{ height: `${(day.completed / maxActivity) * 100}%`, minHeight: day.completed > 0 ? '4px' : '0' }} title={`Completed: ${day.completed}`} />
                </div>
                <span className="text-xs text-gray-400">{format(new Date(day.date), 'EEE').charAt(0)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 bg-pink-300 dark:bg-pink-700 rounded" />Created</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded" />Completed</div>
          </div>
        </div>

        {/* Upcoming due */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Due Soon</p>
          {stats.upcomingDue.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Nothing due soon 🎉</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingDue.map(todo => (
                <div key={todo.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[todo.priority] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{todo.title}</p>
                    {todo.dueDate && (
                      <p className={`text-xs ${isToday(new Date(todo.dueDate)) ? 'text-orange-500' : 'text-gray-400'}`}>
                        {isToday(new Date(todo.dueDate)) ? 'Today' : format(new Date(todo.dueDate), 'MMM d')}
                      </p>
                    )}
                  </div>
                  {todo.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: todo.category.color + '22', color: todo.category.color }}>
                      {todo.category.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      {stats.byCategory.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">By Category</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.byCategory.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{cat.name}</span>
                <span className="ml-auto text-sm font-bold text-gray-500">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
