(function () {
  'use strict'

  // CustomChatAI Widget
  class CustomChatAIWidget {
    constructor(config) {
      this.apiKey = config.apiKey
      this.baseUrl = config.baseUrl || window.location.origin
      this.theme = config.theme || 'light'
      this.model = config.model || 'llama3'
      this.position = config.position || 'bottom-right'
      this.buttonColor = config.buttonColor || '#2563eb'

      this.isOpen = false
      this.messages = []

      this.init()
    }

    init() {
      this.createStyles()
      this.createWidget()
      this.attachEventListeners()
    }

    createStyles() {
      const style = document.createElement('style')
      style.textContent = `
        .customchatai-widget-button {
          position: fixed;
          ${this.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
          ${this.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: ${this.buttonColor};
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          z-index: 9999;
          transition: transform 0.2s;
        }

        .customchatai-widget-button:hover {
          transform: scale(1.1);
        }

        .customchatai-widget-container {
          position: fixed;
          ${this.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
          ${this.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          width: 400px;
          height: 600px;
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 120px);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          z-index: 9998;
          display: none;
        }

        .customchatai-widget-container.open {
          display: block;
        }

        .customchatai-widget-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `
      document.head.appendChild(style)
    }

    createWidget() {
      // Create button
      const button = document.createElement('button')
      button.className = 'customchatai-widget-button'
      button.innerHTML = '💬'
      button.setAttribute('aria-label', 'Open chat')
      this.button = button

      // Create container
      const container = document.createElement('div')
      container.className = 'customchatai-widget-container'

      // Create iframe
      const iframe = document.createElement('iframe')
      iframe.className = 'customchatai-widget-iframe'
      iframe.src = `${this.baseUrl}/embed/chat?userKey=${this.apiKey}&theme=${this.theme}&model=${this.model}`
      iframe.setAttribute('title', 'CustomChatAI Widget')

      container.appendChild(iframe)
      this.container = container

      document.body.appendChild(button)
      document.body.appendChild(container)
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => {
        this.toggle()
      })

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close()
        }
      })
    }

    toggle() {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    }

    open() {
      this.container.classList.add('open')
      this.button.innerHTML = '✕'
      this.isOpen = true
    }

    close() {
      this.container.classList.remove('open')
      this.button.innerHTML = '💬'
      this.isOpen = false
    }
  }

  // Expose to global scope
  window.CustomChatAIWidget = CustomChatAIWidget

  // Auto-initialize if data-attributes are present
  document.addEventListener('DOMContentLoaded', () => {
    const script = document.currentScript || document.querySelector('script[data-customchatai-key]')

    if (script) {
      const apiKey = script.getAttribute('data-customchatai-key')
      const baseUrl = script.getAttribute('data-customchatai-url')
      const theme = script.getAttribute('data-customchatai-theme')
      const model = script.getAttribute('data-customchatai-model')
      const position = script.getAttribute('data-customchatai-position')
      const buttonColor = script.getAttribute('data-customchatai-color')

      if (apiKey) {
        new CustomChatAIWidget({
          apiKey,
          baseUrl,
          theme,
          model,
          position,
          buttonColor,
        })
      }
    }
  })
})()
