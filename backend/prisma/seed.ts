import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const password = await bcrypt.hash('demo123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@todolist.app' },
    update: {},
    create: { username: 'demo', email: 'demo@todolist.app', password }
  })
  console.log('✅ User created:', user.email)

  // Clean existing data
  await prisma.todoTag.deleteMany({ where: { todo: { userId: user.id } } })
  await prisma.todo.deleteMany({ where: { userId: user.id } })
  await prisma.category.deleteMany({ where: { userId: user.id } })
  await prisma.tag.deleteMany({ where: { userId: user.id } })

  // Categories
  const [work, personal, shopping, health] = await Promise.all([
    prisma.category.create({ data: { name: 'Work', color: '#3b82f6', icon: 'briefcase', userId: user.id } }),
    prisma.category.create({ data: { name: 'Personal', color: '#10b981', icon: 'heart', userId: user.id } }),
    prisma.category.create({ data: { name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart', userId: user.id } }),
    prisma.category.create({ data: { name: 'Health', color: '#ef4444', icon: 'heart', userId: user.id } })
  ])

  // Tags
  const [important, quick, waiting] = await Promise.all([
    prisma.tag.create({ data: { name: 'important', color: '#ef4444', userId: user.id } }),
    prisma.tag.create({ data: { name: 'quick', color: '#22c55e', userId: user.id } }),
    prisma.tag.create({ data: { name: 'waiting', color: '#f59e0b', userId: user.id } })
  ])

  const now = new Date()
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7)
  const lastWeek = new Date(now); lastWeek.setDate(now.getDate() - 7)

  // Todos
  const t1 = await prisma.todo.create({
    data: {
      title: 'Prepare Q4 performance report',
      description: 'Compile metrics from all departments and create executive summary. Include revenue, customer satisfaction, and team performance KPIs.',
      status: 'IN_PROGRESS', priority: 'URGENT', order: 1,
      dueDate: tomorrow, categoryId: work.id, userId: user.id,
      tags: { create: [{ tagId: important.id }] }
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Review pull requests for authentication module',
      description: 'Three PRs waiting for review: JWT refresh tokens, OAuth2 integration, and password reset flow.',
      status: 'TODO', priority: 'HIGH', order: 2,
      dueDate: tomorrow, categoryId: work.id, userId: user.id,
      tags: { create: [{ tagId: important.id }, { tagId: quick.id }] }
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Schedule team retrospective',
      status: 'DONE', priority: 'MEDIUM', order: 3,
      completedAt: yesterday, categoryId: work.id, userId: user.id,
      tags: { create: [{ tagId: quick.id }] }
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Update project dependencies',
      description: 'Run npm audit and update all packages with security vulnerabilities. Test after each major update.',
      status: 'TODO', priority: 'MEDIUM', order: 4,
      dueDate: nextWeek, categoryId: work.id, userId: user.id
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Write unit tests for payment service',
      description: 'Coverage is at 45%, target is 80%. Focus on edge cases: failed payments, refunds, and subscription renewals.',
      status: 'TODO', priority: 'HIGH', order: 5,
      dueDate: nextWeek, categoryId: work.id, userId: user.id,
      tags: { create: [{ tagId: important.id }] }
    }
  })

  // Subtasks for t1
  await prisma.todo.createMany({
    data: [
      { title: 'Gather data from all teams', status: 'DONE', priority: 'HIGH', order: 1, parentId: t1.id, userId: user.id, completedAt: yesterday },
      { title: 'Create charts and visualizations', status: 'IN_PROGRESS', priority: 'HIGH', order: 2, parentId: t1.id, userId: user.id },
      { title: 'Write executive summary', status: 'TODO', priority: 'URGENT', order: 3, parentId: t1.id, userId: user.id },
      { title: 'Get approval from manager', status: 'TODO', priority: 'URGENT', order: 4, parentId: t1.id, userId: user.id }
    ]
  })

  const t6 = await prisma.todo.create({
    data: {
      title: 'Weekly grocery run',
      description: 'Fruits, vegetables, proteins, and household supplies.',
      status: 'TODO', priority: 'MEDIUM', order: 6,
      dueDate: tomorrow, categoryId: shopping.id, userId: user.id,
      tags: { create: [{ tagId: quick.id }] }
    }
  })

  await prisma.todo.createMany({
    data: [
      { title: 'Apples, bananas, oranges', status: 'TODO', priority: 'LOW', order: 1, parentId: t6.id, userId: user.id },
      { title: 'Chicken breast, eggs', status: 'TODO', priority: 'LOW', order: 2, parentId: t6.id, userId: user.id },
      { title: 'Dish soap, paper towels', status: 'DONE', priority: 'LOW', order: 3, parentId: t6.id, userId: user.id, completedAt: yesterday }
    ]
  })

  await prisma.todo.create({
    data: {
      title: 'Buy birthday gift for Sarah',
      status: 'TODO', priority: 'HIGH', order: 7,
      dueDate: nextWeek, categoryId: shopping.id, userId: user.id,
      tags: { create: [{ tagId: important.id }] }
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Morning run — 5km',
      description: 'Target pace: under 6 min/km. Use the park route.',
      status: 'DONE', priority: 'MEDIUM', order: 8,
      completedAt: now, categoryId: health.id, userId: user.id,
      tags: { create: [{ tagId: quick.id }] }
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Book annual health checkup',
      status: 'TODO', priority: 'HIGH', order: 9,
      dueDate: nextWeek, categoryId: health.id, userId: user.id,
      tags: { create: [{ tagId: waiting.id }] }
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Meditate for 15 minutes',
      status: 'DONE', priority: 'LOW', order: 10,
      completedAt: lastWeek, categoryId: health.id, userId: user.id
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Read "Designing Data-Intensive Applications"',
      description: 'Currently on chapter 5. Goal: finish by end of month.',
      status: 'IN_PROGRESS', priority: 'LOW', order: 11,
      categoryId: personal.id, userId: user.id
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Fix kitchen faucet leak',
      status: 'TODO', priority: 'MEDIUM', order: 12,
      dueDate: nextWeek, categoryId: personal.id, userId: user.id,
      tags: { create: [{ tagId: waiting.id }] }
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Plan weekend hiking trip',
      status: 'TODO', priority: 'LOW', order: 13,
      categoryId: personal.id, userId: user.id
    }
  })

  // Overdue todo for demo
  await prisma.todo.create({
    data: {
      title: 'Submit expense report',
      description: 'Q3 expenses need to be submitted to finance.',
      status: 'TODO', priority: 'URGENT', order: 14,
      dueDate: lastWeek, categoryId: work.id, userId: user.id,
      tags: { create: [{ tagId: important.id }] }
    }
  })

  await prisma.todo.create({
    data: {
      title: 'Archive old project files',
      status: 'ARCHIVED', priority: 'LOW', order: 15,
      categoryId: work.id, userId: user.id
    }
  })

  console.log('✅ Seed complete!')
  console.log('   Demo account: demo@todolist.app / demo123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
