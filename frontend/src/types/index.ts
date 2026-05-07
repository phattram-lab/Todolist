export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  _count?: { todos: number }
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  _count?: { todos: number }
}

export interface Tag {
  id: string
  name: string
  color: string
  _count?: { todos: number }
}

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  priority: Priority
  dueDate?: string
  order: number
  createdAt: string
  updatedAt: string
  completedAt?: string
  category?: Category
  tags: Tag[]
  _count?: { subtasks: number }
  subtaskStats?: { total: number; completed: number }
  subtasks?: Todo[]
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface TodoFilters {
  status?: TodoStatus | ''
  priority?: Priority | ''
  categoryId?: string
  tagId?: string
  search?: string
  sort?: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'order'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface Stats {
  total: number
  completed: number
  inProgress: number
  todo: number
  overdue: number
  completionRate: number
  streak: number
  byPriority: Record<Priority, number>
  byStatus: Record<TodoStatus, number>
  byCategory: Array<{ id: string; name: string; color: string; count: number }>
  recentActivity: Array<{ date: string; completed: number; created: number }>
  upcomingDue: Todo[]
}
