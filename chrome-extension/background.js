// Trading Checklist Chrome Extension - Background Service Worker

class BackgroundService {
  constructor() {
    this.init()
  }

  init() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details)
    })

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse)
      return true // Keep message channel open for async responses
    })

    // Handle tab updates to inject content script
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab)
    })

    // Handle extension icon click
    chrome.action.onClicked.addListener((tab) => {
      this.handleIconClick(tab)
    })
  }

  handleInstallation(details) {
    if (details.reason === 'install') {
      // First time installation
      this.setDefaultSettings()
      this.openWelcomePage()
    } else if (details.reason === 'update') {
      // Extension updated
      console.log('Trading Checklist extension updated')
    }
  }

  async setDefaultSettings() {
    try {
      await chrome.storage.sync.set({
        autoDetectPair: true,
        showNotifications: true,
        overlayPosition: false, // false = left, true = right
        currentStrategy: 'ICT 2022 Entry Model'
      })
    } catch (error) {
      console.error('Failed to set default settings:', error)
    }
  }

  openWelcomePage() {
    chrome.tabs.create({
      url: 'https://trading-checklist-app.vercel.app/?welcome=extension'
    })
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'openApp':
          await this.openMainApp()
          sendResponse({ success: true })
          break

        case 'syncData':
          const syncResult = await this.syncWithMainApp()
          sendResponse({ success: true, data: syncResult })
          break

        case 'updateStats':
          await this.updateTodayStats(message.stats)
          sendResponse({ success: true })
          break

        case 'getSettings':
          const settings = await chrome.storage.sync.get()
          sendResponse({ success: true, settings })
          break

        case 'saveSettings':
          await chrome.storage.sync.set(message.settings)
          sendResponse({ success: true })
          break

        default:
          sendResponse({ success: false, error: 'Unknown action' })
      }
    } catch (error) {
      console.error('Background message handling error:', error)
      sendResponse({ success: false, error: error.message })
    }
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    // Only inject on TradingView pages when they finish loading
    if (changeInfo.status === 'complete' && 
        tab.url && 
        tab.url.includes('tradingview.com')) {
      
      try {
        // Check if content script is already injected
        const result = await chrome.tabs.sendMessage(tabId, { action: 'ping' })
          .catch(() => null)
        
        if (!result) {
          // Inject content script
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
          })
        }
      } catch (error) {
        console.error('Failed to inject content script:', error)
      }
    }
  }

  async handleIconClick(tab) {
    // If on TradingView, show overlay directly
    if (tab.url && tab.url.includes('tradingview.com')) {
      try {
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'showOverlay',
          settings: await chrome.storage.sync.get()
        })
      } catch (error) {
        console.error('Failed to show overlay:', error)
        // Fallback: open main app
        await this.openMainApp()
      }
    } else {
      // Not on TradingView, open main app
      await this.openMainApp()
    }
  }

  async openMainApp() {
    try {
      // Check if main app is already open
      const tabs = await chrome.tabs.query({ 
        url: 'https://trading-checklist-app.vercel.app/*' 
      })
      
      if (tabs.length > 0) {
        // Focus existing tab
        await chrome.tabs.update(tabs[0].id, { active: true })
        await chrome.windows.update(tabs[0].windowId, { focused: true })
      } else {
        // Open new tab
        await chrome.tabs.create({
          url: 'https://trading-checklist-app.vercel.app'
        })
      }
    } catch (error) {
      console.error('Failed to open main app:', error)
    }
  }

  async syncWithMainApp() {
    try {
      // Get main app tabs
      const tabs = await chrome.tabs.query({ 
        url: 'https://trading-checklist-app.vercel.app/*' 
      })
      
      if (tabs.length === 0) {
        return { synced: false, reason: 'Main app not open' }
      }

      // Get data from main app
      const result = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          return {
            strategies: localStorage.getItem('tradingStrategies'),
            currentStrategy: localStorage.getItem('currentStrategy'),
            tradeHistory: localStorage.getItem('tradeHistory'),
            timestamp: Date.now()
          }
        }
      })

      if (result[0]?.result) {
        const data = result[0].result
        
        // Store in extension storage
        await chrome.storage.local.set({
          strategies: data.strategies ? JSON.parse(data.strategies) : [],
          currentStrategy: data.currentStrategy ? JSON.parse(data.currentStrategy) : null,
          tradeHistory: data.tradeHistory ? JSON.parse(data.tradeHistory) : [],
          lastSync: data.timestamp
        })

        return { synced: true, timestamp: data.timestamp }
      }

      return { synced: false, reason: 'No data received' }
    } catch (error) {
      console.error('Sync failed:', error)
      return { synced: false, reason: error.message }
    }
  }

  async updateTodayStats(stats) {
    try {
      await chrome.storage.local.set({ todayStats: stats })
      
      // Notify popup if open
      try {
        await chrome.runtime.sendMessage({
          action: 'updateStats',
          stats
        })
      } catch (error) {
        // Popup not open, ignore
      }
    } catch (error) {
      console.error('Failed to update today stats:', error)
    }
  }

  // Periodic sync with main app
  async startPeriodicSync() {
    setInterval(async () => {
      try {
        await this.syncWithMainApp()
      } catch (error) {
        console.error('Periodic sync failed:', error)
      }
    }, 5 * 60 * 1000) // Every 5 minutes
  }
}

// Initialize background service
const backgroundService = new BackgroundService()

// Start periodic sync
backgroundService.startPeriodicSync()

// Handle extension lifecycle
chrome.runtime.onStartup.addListener(() => {
  console.log('Trading Checklist extension started')
})

chrome.runtime.onSuspend.addListener(() => {
  console.log('Trading Checklist extension suspended')
})

// Context menu integration (optional)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'open-checklist',
    title: 'Open Trading Checklist',
    contexts: ['page'],
    documentUrlPatterns: ['*://www.tradingview.com/*']
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'open-checklist') {
    try {
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'showOverlay',
        settings: await chrome.storage.sync.get()
      })
    } catch (error) {
      console.error('Failed to show overlay from context menu:', error)
    }
  }
}) 