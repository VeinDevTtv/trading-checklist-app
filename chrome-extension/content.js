// Trading Checklist Chrome Extension - Content Script
// Injects overlay on TradingView pages

class TradingChecklistOverlay {
  constructor() {
    this.overlay = null
    this.isVisible = false
    this.settings = {}
    this.currentStrategy = null
    this.init()
  }

  async init() {
    // Load settings from extension storage
    await this.loadSettings()
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse)
    })

    // Auto-detect currency pair if enabled
    if (this.settings.autoDetectPair) {
      this.detectCurrencyPair()
    }
  }

  async loadSettings() {
    try {
      this.settings = await chrome.storage.sync.get([
        'autoDetectPair',
        'showNotifications',
        'overlayPosition',
        'currentStrategy'
      ])
      
      this.currentStrategy = this.settings.currentStrategy
    } catch (error) {
      console.error('Failed to load extension settings:', error)
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'showOverlay':
        this.showOverlay(message.settings)
        sendResponse({ success: true })
        break
      case 'hideOverlay':
        this.hideOverlay()
        sendResponse({ success: true })
        break
      case 'setStrategy':
        this.currentStrategy = message.strategy
        this.updateOverlayStrategy()
        sendResponse({ success: true })
        break
      default:
        sendResponse({ success: false, error: 'Unknown action' })
    }
  }

  detectCurrencyPair() {
    try {
      // Try to detect currency pair from TradingView URL or page content
      const url = window.location.href
      const symbolMatch = url.match(/symbol=([A-Z]{6})/i)
      
      if (symbolMatch) {
        const symbol = symbolMatch[1]
        const pair = `${symbol.slice(0, 3)}/${symbol.slice(3, 6)}`
        this.detectedPair = pair
        
        if (this.overlay) {
          this.updateOverlayPair(pair)
        }
      }
    } catch (error) {
      console.error('Failed to detect currency pair:', error)
    }
  }

  showOverlay(settings = {}) {
    if (this.overlay) {
      this.overlay.style.display = 'block'
      this.isVisible = true
      return
    }

    this.createOverlay(settings)
    this.isVisible = true
  }

  hideOverlay() {
    if (this.overlay) {
      this.overlay.style.display = 'none'
      this.isVisible = false
    }
  }

  createOverlay(settings) {
    // Create overlay container
    this.overlay = document.createElement('div')
    this.overlay.id = 'trading-checklist-overlay'
    this.overlay.className = 'trading-checklist-overlay'
    
    // Position overlay
    const position = settings.overlayPosition ? 'right' : 'left'
    this.overlay.style.cssText = `
      position: fixed;
      top: 80px;
      ${position}: 20px;
      width: 320px;
      max-height: calc(100vh - 100px);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `

    // Create overlay content
    this.overlay.innerHTML = `
      <div class="overlay-header" style="
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span style="font-weight: 600;">A+ Trade Checklist</span>
        </div>
        <button id="close-overlay" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.8;
          transition: opacity 0.2s;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      
      <div class="overlay-content" style="
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        max-height: calc(100vh - 200px);
      ">
        <div id="strategy-selector" style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Strategy</label>
          <select id="strategy-select" style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: white;
            font-size: 14px;
          ">
            <option value="">Select strategy...</option>
            <option value="ICT 2022 Entry Model">ICT 2022 Entry</option>
            <option value="Regular Price Action">Regular Price Action</option>
            <option value="Supply & Demand">Supply & Demand</option>
          </select>
        </div>

        <div id="pair-info" style="
          margin-bottom: 16px;
          padding: 8px 12px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 12px;
          color: #6b7280;
        ">
          <span id="detected-pair">Detecting pair...</span>
        </div>

        <div id="checklist-container" style="margin-bottom: 16px;">
          <div style="text-align: center; color: #6b7280; padding: 20px;">
            Select a strategy to begin
          </div>
        </div>

        <div id="score-display" style="
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          text-align: center;
          margin-bottom: 16px;
          display: none;
        ">
          <div id="verdict" style="font-weight: 600; margin-bottom: 4px;"></div>
          <div id="score" style="font-size: 12px; color: #6b7280;"></div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="save-trade" style="
            flex: 1;
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          " disabled>
            Save Trade
          </button>
          <button id="open-app" style="
            padding: 8px 12px;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
          ">
            Open App
          </button>
        </div>
      </div>
    `

    // Add event listeners
    this.addEventListeners()

    // Append to page
    document.body.appendChild(this.overlay)

    // Update with current data
    this.updateOverlayStrategy()
    if (this.detectedPair) {
      this.updateOverlayPair(this.detectedPair)
    }
  }

  addEventListeners() {
    // Close button
    this.overlay.querySelector('#close-overlay').addEventListener('click', () => {
      this.hideOverlay()
    })

    // Strategy selector
    this.overlay.querySelector('#strategy-select').addEventListener('change', (e) => {
      this.currentStrategy = e.target.value
      this.loadStrategy(e.target.value)
    })

    // Save trade button
    this.overlay.querySelector('#save-trade').addEventListener('click', () => {
      this.saveTrade()
    })

    // Open app button
    this.overlay.querySelector('#open-app').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openApp' })
    })

    // Make overlay draggable
    this.makeDraggable()
  }

  makeDraggable() {
    const header = this.overlay.querySelector('.overlay-header')
    let isDragging = false
    let currentX = 0
    let currentY = 0
    let initialX = 0
    let initialY = 0

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('#close-overlay')) return
      
      isDragging = true
      initialX = e.clientX - currentX
      initialY = e.clientY - currentY
      header.style.cursor = 'grabbing'
    })

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return

      e.preventDefault()
      currentX = e.clientX - initialX
      currentY = e.clientY - initialY

      this.overlay.style.left = `${currentX}px`
      this.overlay.style.top = `${currentY}px`
      this.overlay.style.right = 'auto'
    })

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false
        header.style.cursor = 'grab'
      }
    })
  }

  async loadStrategy(strategyName) {
    if (!strategyName) {
      this.showEmptyChecklist()
      return
    }

    try {
      // Get strategy data from main app or use defaults
      const strategies = await this.getStrategies()
      const strategy = strategies.find(s => s.name === strategyName)
      
      if (strategy) {
        this.renderChecklist(strategy)
      } else {
        this.showEmptyChecklist()
      }
    } catch (error) {
      console.error('Failed to load strategy:', error)
      this.showEmptyChecklist()
    }
  }

  async getStrategies() {
    // Try to get from main app first
    try {
      const appTabs = await chrome.tabs.query({ url: 'https://trading-checklist-app.vercel.app/*' })
      if (appTabs.length > 0) {
        const result = await chrome.scripting.executeScript({
          target: { tabId: appTabs[0].id },
          func: () => localStorage.getItem('tradingStrategies')
        })
        
        if (result[0]?.result) {
          return JSON.parse(result[0].result)
        }
      }
    } catch (error) {
      console.warn('Could not get strategies from main app:', error)
    }

    // Return default strategies
    return [
      {
        name: "ICT 2022 Entry Model",
        conditions: [
          { id: 1, text: "SMT confirmed", importance: "high" },
          { id: 2, text: "BOS after FVG", importance: "high" },
          { id: 3, text: "Killzone timing", importance: "medium" },
          { id: 4, text: "Clean OB mitigation", importance: "medium" },
          { id: 5, text: "RR ≥ 1:3", importance: "low" }
        ]
      },
      {
        name: "Regular Price Action",
        conditions: [
          { id: 6, text: "Break / Retest confirmed", importance: "high" },
          { id: 7, text: "Clear trend direction", importance: "medium" },
          { id: 8, text: "Support/Resistance respected", importance: "medium" },
          { id: 9, text: "No upcoming red‑folder news", importance: "low" }
        ]
      },
      {
        name: "Supply & Demand",
        conditions: [
          { id: 10, text: "Fresh S/D zone", importance: "high" },
          { id: 11, text: "Liquidity sweep into zone", importance: "high" },
          { id: 12, text: "Lower‑TF BOS out of zone", importance: "medium" },
          { id: 13, text: "Confluence with HTF imbalance", importance: "low" }
        ]
      }
    ]
  }

  renderChecklist(strategy) {
    const container = this.overlay.querySelector('#checklist-container')
    const checkedIds = new Set()

    container.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">${strategy.name}</div>
        <div style="font-size: 12px; color: #6b7280;">Check conditions as they're met</div>
      </div>
      <div class="conditions">
        ${strategy.conditions.map(condition => `
          <label style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 6px;
            cursor: pointer;
            transition: background 0.2s;
          " class="condition-item">
            <input type="checkbox" data-id="${condition.id}" style="
              width: 16px;
              height: 16px;
              accent-color: #3b82f6;
            ">
            <div style="flex: 1;">
              <div style="font-size: 13px; color: #1f2937;">${condition.text}</div>
              <div style="
                font-size: 10px;
                color: ${condition.importance === 'high' ? '#dc2626' : condition.importance === 'medium' ? '#f59e0b' : '#16a34a'};
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">${condition.importance}</div>
            </div>
          </label>
        `).join('')}
      </div>
    `

    // Add checkbox listeners
    container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateScore(strategy)
      })
    })

    // Show score display
    this.overlay.querySelector('#score-display').style.display = 'block'
    this.updateScore(strategy)
  }

  updateScore(strategy) {
    const checkboxes = this.overlay.querySelectorAll('input[type="checkbox"]')
    const checkedIds = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.dataset.id))

    // Calculate score
    const importanceWeights = { high: 3, medium: 2, low: 1 }
    let score = 0
    let possibleScore = 0

    strategy.conditions.forEach(condition => {
      const weight = importanceWeights[condition.importance]
      possibleScore += weight
      if (checkedIds.includes(condition.id)) {
        score += weight
      }
    })

    const percentage = possibleScore > 0 ? Math.round((score / possibleScore) * 100) : 0
    
    // Determine verdict
    const highPriorityConditions = strategy.conditions.filter(c => c.importance === 'high')
    const checkedHighPriority = highPriorityConditions.filter(c => checkedIds.includes(c.id))
    const allHighPriorityMet = checkedHighPriority.length === highPriorityConditions.length
    const verdict = (allHighPriorityMet || percentage >= 85) ? "A+" : "Not A+"

    // Update display
    const verdictEl = this.overlay.querySelector('#verdict')
    const scoreEl = this.overlay.querySelector('#score')
    const saveBtn = this.overlay.querySelector('#save-trade')

    verdictEl.textContent = verdict === "A+" ? "✅ A+ Setup" : "⚠️ Not A+"
    verdictEl.style.color = verdict === "A+" ? "#16a34a" : "#f59e0b"
    scoreEl.textContent = `Score: ${score}/${possibleScore} (${percentage}%)`
    
    saveBtn.disabled = checkedIds.length === 0
    saveBtn.style.opacity = checkedIds.length === 0 ? '0.5' : '1'
    saveBtn.style.cursor = checkedIds.length === 0 ? 'not-allowed' : 'pointer'

    // Store current analysis
    this.currentAnalysis = {
      strategy: strategy.name,
      checkedIds,
      score,
      possibleScore,
      percentage,
      verdict,
      pair: this.detectedPair
    }
  }

  showEmptyChecklist() {
    const container = this.overlay.querySelector('#checklist-container')
    container.innerHTML = `
      <div style="text-align: center; color: #6b7280; padding: 20px;">
        Select a strategy to begin
      </div>
    `
    this.overlay.querySelector('#score-display').style.display = 'none'
  }

  updateOverlayStrategy() {
    if (!this.overlay || !this.currentStrategy) return
    
    const select = this.overlay.querySelector('#strategy-select')
    if (select) {
      select.value = this.currentStrategy
      this.loadStrategy(this.currentStrategy)
    }
  }

  updateOverlayPair(pair) {
    if (!this.overlay) return
    
    const pairEl = this.overlay.querySelector('#detected-pair')
    if (pairEl) {
      pairEl.textContent = `Detected: ${pair}`
    }
  }

  async saveTrade() {
    if (!this.currentAnalysis) return

    try {
      // Send to main app if open
      const appTabs = await chrome.tabs.query({ url: 'https://trading-checklist-app.vercel.app/*' })
      
      if (appTabs.length > 0) {
        await chrome.tabs.sendMessage(appTabs[0].id, {
          action: 'saveTrade',
          data: this.currentAnalysis
        })
      }

      // Show notification if enabled
      if (this.settings.showNotifications) {
        this.showNotification('Trade saved successfully!', 'success')
      }

      // Reset checklist
      this.overlay.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false
      })
      this.updateScore(this.currentAnalysis.strategy)

    } catch (error) {
      console.error('Failed to save trade:', error)
      this.showNotification('Failed to save trade', 'error')
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#3b82f6'};
      color: white;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    `
    notification.textContent = message

    // Add animation styles
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
      style.remove()
    }, 3000)
  }
}

// Initialize overlay when content script loads
let overlay = null

// Only initialize on TradingView pages
if (window.location.hostname.includes('tradingview.com')) {
  overlay = new TradingChecklistOverlay()
}

// Export for testing
window.TradingChecklistOverlay = TradingChecklistOverlay 