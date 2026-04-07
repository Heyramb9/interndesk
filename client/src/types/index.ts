export type Role = 'intern' | 'mentor' | 'manager'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  initials: string
  avatarGradient?: string
}

export interface Task {
  id: number
  name: string
  done: boolean
  due?: string
  priority?: 'urgent' | 'in-progress' | 'upcoming' | 'learning'
}

export interface ScheduleEvent {
  time: string
  title: string
  sub: string
  color: string
}

export interface Announcement {
  id: number
  title: string
  text: string
  date: string
  color: string
}

export interface Intern {
  id: number
  name: string
  initials: string
  track: string
  mentor: string
  progress: number
  status: 'on-track' | 'at-risk' | 'completed'
  email?: string
  gradient?: string
}

export interface Mentor {
  id: number
  name: string
  initials: string
  title: string
  available: boolean
  internsCount: number
}

export interface ActivityItem {
  id: number
  icon: string
  text: string
  time: string
  color: string
}

export interface Alert {
  id: number
  level: 'red' | 'amber' | 'blue'
  icon: string
  text: string
  action?: string
  actionFn?: string
}
