export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Chapter {
  _id: string
  chName: string
  subject: string
}

export interface Subject {
  id: number
  name: string
  description: string
  chapters: Chapter[]
  globalResources: any[]
  createdAt: string
  updatedAt: string
}