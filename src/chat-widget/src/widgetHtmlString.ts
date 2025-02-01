export const widgetHTML = `
  <div id="buildship-chat-widget" class="buildship-chat-widget buildship-chat-widget--hidden">
    <div class="buildship-chat-widget__container">
      <!-- Header -->
      <header class="buildship-chat-widget__header">
        <h2 class="buildship-chat-widget__title">Chat</h2>
        <button type="button" class="buildship-chat-widget__close" aria-label="Close chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </header>

      <!-- Messages Container -->
      <div class="buildship-chat-widget__messages">
        <div class="buildship-chat-widget__messages-container"></div>
        <div class="buildship-chat-widget__typing" style="display: none;">
          <div class="buildship-chat-widget__typing-bubble"></div>
          <div class="buildship-chat-widget__typing-bubble"></div>
          <div class="buildship-chat-widget__typing-bubble"></div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="buildship-chat-widget__input-area">
        <form id="buildship-chat-widget__form" class="buildship-chat-widget__form">
          <div class="buildship-chat-widget__input-container">
            <textarea
              id="buildship-chat-widget__input"
              class="buildship-chat-widget__input"
              placeholder="Type a message..."
              rows="1"
              maxlength="1000"
              aria-label="Message input"
            ></textarea>
            <button 
              type="button" 
              id="buildship-chat-widget__mic" 
              class="buildship-chat-widget__mic" 
              aria-label="Record voice message"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C11.2044 2 10.4413 2.31607 9.87868 2.87868C9.31607 3.44129 9 4.20435 9 5V12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12V5C15 4.20435 14.6839 3.44129 14.1213 2.87868C13.5587 2.31607 12.7956 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.73749 15.637 5 13.8565 5 12V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 19V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 22H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button 
              type="submit" 
              class="buildship-chat-widget__submit" 
              aria-label="Send message"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
`
