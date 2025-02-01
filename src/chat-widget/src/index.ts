import { UIManager } from "./modules/uiManager"
import { MessageHandler } from "./modules/messageHandler"
import { SpeechRecognitionManager } from "./modules/speechRecognition"
import { WidgetConfig } from "./types/config"
import "./widget.css"

class ChatWidget {
  private config: WidgetConfig
  private uiManager: UIManager
  private messageHandler: MessageHandler
  private speechRecognition: SpeechRecognitionManager
  private initialized: boolean = false
  private initPromise: Promise<void> | null = null

  constructor(config: Partial<WidgetConfig>) {
    // Set default config values
    this.config = {
      url: "",
      threadId: null,
      responseIsAStream: false,
      user: null,
      widgetTitle: "Chat",
      greetingMessage: null,
      disableErrorAlert: false,
      closeOnOutsideClick: true,
      openOnLoad: false,
      showAs: 'modal',
      enableAudioInput: true,
      autoSendAudioMessage: false,
      ...config
    }

    // Initialize managers
    this.uiManager = new UIManager(this.config)
    this.messageHandler = new MessageHandler(this.config, this.uiManager)
    this.speechRecognition = new SpeechRecognitionManager(this.config)
  }

  private async ensureInitialized() {
    if (this.initialized) return

    // If initialization is already in progress, wait for it
    if (this.initPromise) {
      await this.initPromise
      return
    }

    // Start initialization
    this.initPromise = this.init()
    await this.initPromise
  }

  public async init() {
    if (this.initialized) return
    
    // Setup event handlers
    this.setupEventHandlers()
    
    this.initialized = true

    // Open widget if configured to do so
    if (this.config.openOnLoad) {
      // Use a dummy event since we don't have a trigger element
      this.uiManager.open({ target: document.body })
    }
  }

  private setupEventHandlers() {
    const form = document.querySelector('#buildship-chat-widget__form')
    const micButton = document.querySelector('#buildship-chat-widget__mic')
    const widget = document.querySelector('#buildship-chat-widget')

    if (form) {
      form.addEventListener('submit', (e) => this.messageHandler.handleSubmit(e))
    }

    if (micButton && widget) {
      micButton.addEventListener('click', (e) => {
        this.speechRecognition.toggleRecording(e, widget as HTMLElement)
      })
    }
  }

  public async open(event: { target: HTMLElement }) {
    await this.ensureInitialized()
    this.uiManager.open(event)
  }

  public async close() {
    await this.ensureInitialized()
    this.uiManager.close()
  }
}

// Create widget instance with global config
const globalConfig = (window as any).buildShipChatWidget?.config || {}
const chatWidget = new ChatWidget(globalConfig)

// Export the instance and class
export { chatWidget as default, ChatWidget }
