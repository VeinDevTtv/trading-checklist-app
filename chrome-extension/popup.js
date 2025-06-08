// Chrome Extension Popup Script
class PopupController {
  constructor() {
    this.appUrl = 'https://trading-checklist-app.vercel.app'
    this.init()
  }

  async init() {
    await this.loadSettings()
    await this.loadStrategies()
    await this.loadTodayStats()
    this.bindEvents()
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'autoDetectPair',
        'showNotifications', 
        'overlayPosition',
        'currentStrategy'
      ])
      
      document.getElementById('autoDetectPair').checked = result.autoDetectPair !== false
      document.getElementById('showNotifications').checked = result.showNotifications !== false
      document.getElementById('overlayPosition').checked = result.overlayPosition === true
      
      if (result.currentStrategy) {
        this.updateCurrentStrategy(result.currentStrategy)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  async loadStrategies() {
    try {
      // Try to get strategies from the main app's localStorage
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (tab.url?.includes('trading-checklist-app.vercel.app')) {
        // If we're on the main app, get strategies directly
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const strategies = localStorage.getItem('tradingStrategies')
            const currentStrategy = localStorage.getItem('currentStrategy')
            return { strategies, currentStrategy }
          }
        })
        
        if (result[0]?.result) {
          const { strategies, currentStrategy } = result[0].result
          this.populateStrategies(strategies ? JSON.parse(strategies) : [])
          if (currentStrategy) {
            this.updateCurrentStrategy(JSON.parse(currentStrategy))
          }
        }
      } else {
        // Load from extension storage as fallback
        const result = await chrome.storage.local.get(['strategies', 'currentStrategy'])
        this.populateStrategies(result.strategies || [])
        if (result.currentStrategy) {
          this.updateCurrentStrategy(result.currentStrategy)
        }
      }
    } catch (error) {
      console.error('Failed to load strategies:', error)
      this.populateStrategies([]) // Load default strategies
    }
  }

  populateStrategies(strategies) {
    const selector = document.getElementById('strategySelector')
    selector.innerHTML = '<option value="">Select Strategy...</option>'
    
    // Add default strategies
    const defaultStrategies = [
      'ICT 2022 Entry Model',
      'Regular Price Action',
      'Supply & Demand'
    ]
    
    defaultStrategies.forEach(name => {
      const option = document.createElement('option')
      option.value = name
      option.textContent = name
      selector.appendChild(option)
    })
    
    // Add custom strategies
    strategies.forEach(strategy => {
      if (!defaultStrategies.includes(strategy.name)) {
        const option = document.createElement('option')
        option.value = strategy.name
        option.textContent = strategy.name
        selector.appendChild(option)
      }
    })
  }

  updateCurrentStrategy(strategy) {
    const strategyInfo = document.getElementById('strategyInfo')
    const strategyName = strategyInfo.querySelector('.strategy-name')
    const conditionCount = document.getElementById('conditionCount')
    const lastScore = document.getElementById('lastScore')
    
    if (typeof strategy === 'string') {
      strategyName.textContent = strategy
      conditionCount.textContent = '-'
      lastScore.textContent = '-'
    } else {
      strategyName.textContent = strategy.name || 'Unknown Strategy'
      conditionCount.textContent = strategy.conditions?.length || 0
      lastScore.textContent = strategy.lastScore ? `${strategy.lastScore}%` : '-'
    }
    
    // Update selector
    const selector = document.getElementById('strategySelector')
    selector.value = typeof strategy === 'string' ? strategy : strategy.name
  }

  async loadTodayStats() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (tab.url?.includes('trading-checklist-app.vercel.app')) {
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const trades = localStorage.getItem('tradeHistory')
            if (!trades) return { todayTrades: 0, todayAPlus: 0, todayWinRate: 0 }
            
            const tradeHistory = JSON.parse(trades)
            const today = new Date().toDateString()
            
            const todayTrades = tradeHistory.filter(trade => 
              new Date(trade.timestamp).toDateString() === today
            )
            
            const todayAPlus = todayTrades.filter(trade => trade.verdict === 'A+').length
            const todayWins = todayTrades.filter(trade => trade.outcome === 'win').length
            const todayWinRate = todayTrades.length > 0 ? (todayWins / todayTrades.length * 100) : 0
            
            return {
              todayTrades: todayTrades.length,
              todayAPlus,
              todayWinRate: Math.round(todayWinRate)
            }
          }
        })
        
        if (result[0]?.result) {
          this.updateTodayStats(result[0].result)
        }
      } else {
        // Load from extension storage
        const result = await chrome.storage.local.get(['todayStats'])
        this.updateTodayStats(result.todayStats || { todayTrades: 0, todayAPlus: 0, todayWinRate: 0 })
      }
    } catch (error) {
      console.error('Failed to load today stats:', error)
      this.updateTodayStats({ todayTrades: 0, todayAPlus: 0, todayWinRate: 0 })
    }
  }

  updateTodayStats({ todayTrades, todayAPlus, todayWinRate }) {
    document.getElementById('todayTrades').textContent = todayTrades
    document.getElementById('todayAPlus').textContent = todayAPlus
    document.getElementById('todayWinRate').textContent = `${todayWinRate}%`
  }

  bindEvents() {
    // Open overlay button
    document.getElementById('openOverlay').addEventListener('click', async () => {
      await this.openOverlay()
    })

    // Open full app button
    document.getElementById('openFullApp').addEventListener('click', () => {
      chrome.tabs.create({ url: this.appUrl })
      window.close()
    })

    // Strategy selector
    document.getElementById('strategySelector').addEventListener('change', async (e) => {
      if (e.target.value) {
        await this.setCurrentStrategy(e.target.value)
      }
    })

    // Settings checkboxes
    document.getElementById('autoDetectPair').addEventListener('change', (e) => {
      chrome.storage.sync.set({ autoDetectPair: e.target.checked })
    })

    document.getElementById('showNotifications').addEventListener('change', (e) => {
      chrome.storage.sync.set({ showNotifications: e.target.checked })
    })

    document.getElementById('overlayPosition').addEventListener('change', (e) => {
      chrome.storage.sync.set({ overlayPosition: e.target.checked })
    })

    // Footer links
    document.getElementById('helpLink').addEventListener('click', (e) => {
      e.preventDefault()
      chrome.tabs.create({ url: `${this.appUrl}#help` })
      window.close()
    })

    document.getElementById('feedbackLink').addEventListener('click', (e) => {
      e.preventDefault()
      chrome.tabs.create({ url: 'mailto:feedback@tradingchecklist.app' })
      window.close()
    })
  }

  async openOverlay() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab.url?.includes('tradingview.com')) {
        // If not on TradingView, open it first
        const tvTab = await chrome.tabs.create({ url: 'https://www.tradingview.com/chart/' })
        
        // Wait a bit for the page to load, then inject overlay
        setTimeout(async () => {
          await this.injectOverlay(tvTab.id)
        }, 3000)
      } else {
        // Already on TradingView, inject overlay
        await this.injectOverlay(tab.id)
      }
      
      window.close()
    } catch (error) {
      console.error('Failed to open overlay:', error)
      this.showError('Failed to open overlay. Please try again.')
    }
  }

  async injectOverlay(tabId) {
    try {
      // Inject the overlay content script
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      })
      
      // Send message to show overlay
      await chrome.tabs.sendMessage(tabId, { 
        action: 'showOverlay',
        settings: await chrome.storage.sync.get()
      })
    } catch (error) {
      console.error('Failed to inject overlay:', error)
      throw error
    }
  }

  async setCurrentStrategy(strategyName) {
    try {
      await chrome.storage.sync.set({ currentStrategy: strategyName })
      
      // Update the main app if it's open
      const tabs = await chrome.tabs.query({ url: `${this.appUrl}/*` })
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'setStrategy',
            strategy: strategyName
          })
        } catch (error) {
          // Tab might not have content script, ignore
        }
      }
      
      this.updateCurrentStrategy(strategyName)
    } catch (error) {
      console.error('Failed to set current strategy:', error)
    }
  }

  showError(message) {
    // Simple error display - could be enhanced with a proper notification
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: #fee2e2;
      color: #dc2626;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 1000;
    `
    errorDiv.textContent = message
    document.body.appendChild(errorDiv)
    
    setTimeout(() => {
      errorDiv.remove()
    }, 3000)
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController()
})

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStats') {
    // Update stats in real-time if popup is open
    const popup = window.popupController
    if (popup) {
      popup.updateTodayStats(message.stats)
    }
  }
}) 