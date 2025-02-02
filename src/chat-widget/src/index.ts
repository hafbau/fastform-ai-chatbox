import ChatWidgetComponent from './ChatWidget.svelte'
import { DEFAULT_CONFIG } from './constants/settings'
import { MessageRoles } from './types/messages'

// Import styles
import './ui/styles/base.css'
import './ui/styles/input.css'
import './ui/styles/messages.css'
import './ui/styles/widget.css'

export const ChatWidget = ChatWidgetComponent
export { DEFAULT_CONFIG, MessageRoles }