// Performance Worker Manager
// Handles communication with the web worker for heavy calculations

export interface WorkerMessage {
  id: string
  type: 'calculateKPIs' | 'generateEquityCurve' | 'analyzeDrawdown' | 'calculateStrategyComparison' | 'generateCalendarData' | 'calculateRiskMetrics'
  data: any
}

export interface WorkerResponse {
  id: string
  type: 'success' | 'error'
  result?: any
  error?: string
}

export class PerformanceWorkerManager {
  private worker: Worker | null = null
  private pendingRequests = new Map<string, { resolve: Function; reject: Function }>()
  private requestId = 0

  constructor() {
    this.initWorker()
  }

  private initWorker() {
    try {
      // Create worker from the performance worker file
      this.worker = new Worker(new URL('../workers/performance-worker.js', import.meta.url))
      
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { id, type, result, error } = event.data
        const request = this.pendingRequests.get(id)
        
        if (request) {
          this.pendingRequests.delete(id)
          
          if (type === 'success') {
            request.resolve(result)
          } else {
            request.reject(new Error(error || 'Worker calculation failed'))
          }
        }
      }

      this.worker.onerror = (error) => {
        console.error('Performance worker error:', error)
        // Reject all pending requests
        this.pendingRequests.forEach(({ reject }) => {
          reject(new Error('Worker error occurred'))
        })
        this.pendingRequests.clear()
      }
    } catch (error) {
      console.warn('Web Worker not supported, falling back to main thread calculations')
      this.worker = null
    }
  }

  private generateRequestId(): string {
    return `req-${++this.requestId}-${Date.now()}`
  }

  private async sendMessage(type: WorkerMessage['type'], data: any): Promise<any> {
    if (!this.worker) {
      // Fallback to main thread calculation
      return this.fallbackCalculation(type, data)
    }

    const id = this.generateRequestId()
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      
      const message: WorkerMessage = { id, type, data }
      this.worker!.postMessage(message)
      
      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error('Worker request timeout'))
        }
      }, 30000) // 30 second timeout
    })
  }

  // Fallback calculations for when web worker is not available
  private async fallbackCalculation(type: WorkerMessage['type'], data: any): Promise<any> {
    // Import the calculation functions dynamically
    const { PerformanceAnalytics } = await import('./performance-analytics')
    const analytics = new PerformanceAnalytics()

    switch (type) {
      case 'calculateKPIs':
        return analytics.calculateKPIs(data.trades)
      case 'generateEquityCurve':
        return analytics.generateEquityCurve(data.trades)
      case 'analyzeDrawdown':
        return analytics.analyzeDrawdown(data.trades)
      case 'calculateStrategyComparison':
        return analytics.calculateStrategyComparison(data.trades)
      case 'generateCalendarData':
        return analytics.generateCalendarData(data.trades, data.year, data.month)
      case 'calculateRiskMetrics':
        return analytics.calculateRiskMetrics(data.trades)
      default:
        throw new Error(`Unknown calculation type: ${type}`)
    }
  }

  // Public API methods
  async calculateKPIs(trades: any[]): Promise<any> {
    return this.sendMessage('calculateKPIs', { trades })
  }

  async generateEquityCurve(trades: any[]): Promise<any> {
    return this.sendMessage('generateEquityCurve', { trades })
  }

  async analyzeDrawdown(trades: any[]): Promise<any> {
    return this.sendMessage('analyzeDrawdown', { trades })
  }

  async calculateStrategyComparison(trades: any[]): Promise<any> {
    return this.sendMessage('calculateStrategyComparison', { trades })
  }

  async generateCalendarData(trades: any[], year: number, month: number): Promise<any> {
    return this.sendMessage('generateCalendarData', { trades, year, month })
  }

  async calculateRiskMetrics(trades: any[]): Promise<any> {
    return this.sendMessage('calculateRiskMetrics', { trades })
  }

  // Cleanup
  destroy() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.pendingRequests.clear()
  }
}

// Singleton instance
let workerManager: PerformanceWorkerManager | null = null

export function getPerformanceWorkerManager(): PerformanceWorkerManager {
  if (!workerManager) {
    workerManager = new PerformanceWorkerManager()
  }
  return workerManager
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (workerManager) {
      workerManager.destroy()
      workerManager = null
    }
  })
} 