export type UserRole = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE'

export interface Profile {
  id: string
  email: string
  role: UserRole
  full_name: string
  avatar_url?: string
  created_at: string
}

export interface Career {
  id: string
  name: string
  code: string
  description?: string
  created_at: string
}

export interface Subject {
  id: string
  career_id: string
  name: string
  code: string
  semester: number
  credits: number
  is_elective: boolean
  created_at: string
}

export interface AcademicPeriod {
  id: string
  name: string
  start_date: string
  end_date: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  type: 'SEMESTRAL' | 'MODULAR' | 'ANUAL' | 'VERANO' | 'INVIERNO'
}

export interface Parallel {
  id: string
  subject_id: string
  period_id: string
  docente_id: string
  name: string // A, B, C
  room: string
  schedule: string // e.g., "07:00-09:00"
  days: string[] // ["LUN", "MAR"]
  turn: 'MAÑANA' | 'TARDE' | 'NOCHE'
  capacity: number
  enrolled_count: number
}

export interface Enrollment {
  id: string
  student_id: string
  parallel_id: string
  enrolled_at: string
  status: 'ACTIVE' | 'WITHDRAWN'
}
