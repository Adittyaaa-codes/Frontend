export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Chapter {
  id: number
  name: string
  description: string
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