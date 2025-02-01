export type MessageRole = 'user' | 'assistant'

export interface Message {
  role: MessageRole
  content: string
  timestamp?: number
  id?: string
}

export interface MessageResponse {
  message?: string
  response?: string
  error?: string
}

export interface MessageEvent {
  type: 'message' | 'typing' | 'error'
  data: Message | string
}
