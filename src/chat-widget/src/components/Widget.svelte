<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte'
  import MessageList from './MessageList.svelte'
  import Input from './Input.svelte'
  import Header from './Header.svelte'
  import AudioMode from './AudioMode.svelte'
  import { MessageService } from '../services/MessageService'
  import { MessageRoles } from '../types/messages'
  import '../ui/styles/widget.css'

  export let config

  const dispatch = createEventDispatcher()
  let messages = []
  let isProcessing = false
  let isAudioMode = false
  let aiResponse = ''
  let error = null
  let messageService
  let lastFocusedElement
  let inputComponent
  let showTypingIndicator = false

  onMount(() => {
    lastFocusedElement = document.activeElement
    inputComponent?.focus?.()

    messageService = new MessageService({
      config,
      onAIResponse: (response) => {
        console.log('AI response is here!!!response', response)
        if (typeof response === 'string') {
          aiResponse = response
          // Ensure we're in processing-ai state when response arrives
          if (isAudioMode) {
            isProcessing = true
          }
        }
      },
      appendMessage: (message) => {
        messages = [...messages, message]
      },
      setProcessing: (value) => {
        isProcessing = value
      },
      showTypingIndicator: () => {
        showTypingIndicator = true
      },
      hideTypingIndicator: () => {
        showTypingIndicator = false
      },
    })

    return () => {
      if (lastFocusedElement) {
        lastFocusedElement.focus?.()
      }
    }
  })

  // Message Management
  async function handleSubmit(event) {
    const message = event.detail?.message || event.detail
    if (typeof message !== 'string') {
      console.error('Widget: Invalid message type:', message)
      return
    }

    try {
      isProcessing = true
      error = null
      aiResponse = '' // Clear previous response

      // Add user message to list
      messages = [...messages, {
        id: Date.now().toString(),
        content: message,
        role: MessageRoles.USER,
        timestamp: new Date()
      }]

      // Process message
      await messageService.handleSubmit(message)
    } catch (err) {
      error = err.message || 'Failed to send message'
      dispatch('error', error)
      if (isAudioMode) {
        isProcessing = false
      }
    }
  }

  // Audio Mode Management
  function handleSpeakingComplete() {
    aiResponse = ''
    isProcessing = false
  }

  function handleInterruption() {
    aiResponse = ''
    isProcessing = false
  }

  // Error Handling
  function handleError(event) {
    error = event.detail
    dispatch('error', error)
  }

  // Cleanup
  onDestroy(() => {
    messages = []
    aiResponse = ''
    isProcessing = false
    error = null
  })

  $: if (aiResponse && isAudioMode) {
    console.log('aiResponse updated in Widget:', aiResponse)
  }
</script>

<Header 
  title={config.title}
  onClose={() => dispatch('close')} 
  isCloseButtonVisible={config.mode !== 'fullscreen'}
/>

<AudioMode
  visible={isAudioMode}
  {isProcessing}
  {aiResponse}
  language={config.language}
  on:close={() => {
    isAudioMode = false
    isProcessing = false
    aiResponse = ''
  }}
  on:submit={handleSubmit}
  on:error={handleError}
  on:speakingComplete={handleSpeakingComplete}
  on:interrupted={handleInterruption}
/>
<MessageList {messages} {isAudioMode} isTyping={showTypingIndicator}/>
<Input
  bind:this={inputComponent}
  {isProcessing}
  on:submit={handleSubmit}
  on:openAudioMode={() => {
    isAudioMode = true
    error = null
    aiResponse = ''
  }}
/>
