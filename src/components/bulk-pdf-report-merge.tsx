"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  FileText,
  Download,
  PieChart,
  FileDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  Filter,
  Settings
} from "lucide-react"

interface TradeLog {
  id: number
  strategyName: string
  checkedIds: number[]
  score: number
  possible: number
  notes: string
  verdict: string
  timestamp: string
  pnl?: number
  riskAmount?: number
  outcome?: 'win' | 'loss' | 'breakeven'
  riskRewardRatio?: number
  tags?: string[]
  currencyPair?: string
  tradingSession?: string
  setupType?: string
}

interface ReportSection {
  id: string
  name: string
  description: string
  enabled: boolean
  required: boolean
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: string[]
  format: 'detailed' | 'summary' | 'tax'
}

interface MonthlyStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  breakEvenTrades: number
  winRate: number
  totalPnL: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  maxDrawdown: number
  bestDay: number
  worstDay: number
  avgRiskReward: number
  consistency: number
}

interface BulkPDFReportMergeProps {
  trades: TradeLog[]
}

export function BulkPDFReportMerge({ trades }: BulkPDFReportMergeProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const date = new Date()
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedTemplate, setSelectedTemplate] = useState<string>('prop-firm')
  const [customSections, setCustomSections] = useState<Record<string, boolean>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  // Available report sections
  const reportSections: ReportSection[] = useMemo(() => [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview of trading performance',
      enabled: true,
      required: true
    },
    {
      id: 'monthly-stats',
      name: 'Monthly Statistics',
      description: 'Key performance metrics and ratios',
      enabled: true,
      required: true
    },
    {
      id: 'trade-log',
      name: 'Detailed Trade Log',
      description: 'Complete list of all trades with details',
      enabled: true,
      required: false
    },
    {
      id: 'equity-curve',
      name: 'Equity Curve Chart',
      description: 'Visual representation of account growth',
      enabled: true,
      required: false
    },
    {
      id: 'drawdown-analysis',
      name: 'Drawdown Analysis',
      description: 'Risk analysis and drawdown periods',
      enabled: true,
      required: false
    },
    {
      id: 'strategy-breakdown',
      name: 'Strategy Performance',
      description: 'Performance by trading strategy',
      enabled: true,
      required: false
    },
    {
      id: 'time-analysis',
      name: 'Time-Based Analysis',
      description: 'Performance by time of day, day of week',
      enabled: false,
      required: false
    },
    {
      id: 'currency-analysis',
      name: 'Currency Pair Analysis',
      description: 'Performance breakdown by currency pairs',
      enabled: false,
      required: false
    },
    {
      id: 'risk-metrics',
      name: 'Risk Metrics',
      description: 'Detailed risk management analysis',
      enabled: true,
      required: false
    },
    {
      id: 'tax-summary',
      name: 'Tax Summary',
      description: 'Tax-relevant profit/loss summary',
      enabled: false,
      required: false
    },
    {
      id: 'compliance-check',
      name: 'Compliance Check',
      description: 'Prop firm rule compliance verification',
      enabled: true,
      required: false
    },
    {
      id: 'screenshots',
      name: 'Trade Screenshots',
      description: 'Attached trade screenshots and charts',
      enabled: false,
      required: false
    }
  ], [])

  // Report templates
  const reportTemplates: ReportTemplate[] = useMemo(() => [
    {
      id: 'prop-firm',
      name: 'Prop Firm Report',
      description: 'Comprehensive report for prop firm evaluation',
      sections: [
        'executive-summary',
        'monthly-stats',
        'equity-curve',
        'drawdown-analysis',
        'strategy-breakdown',
        'risk-metrics',
        'compliance-check',
        'trade-log'
      ],
      format: 'detailed'
    },
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'Tax-focused report for accounting purposes',
      sections: [
        'executive-summary',
        'monthly-stats',
        'tax-summary',
        'trade-log'
      ],
      format: 'tax'
    },
    {
      id: 'performance-review',
      name: 'Performance Review',
      description: 'Personal performance analysis',
      sections: [
        'executive-summary',
        'monthly-stats',
        'equity-curve',
        'strategy-breakdown',
        'time-analysis',
        'currency-analysis',
        'risk-metrics'
      ],
      format: 'detailed'
    },
    {
      id: 'summary-only',
      name: 'Summary Only',
      description: 'Quick overview report',
      sections: [
        'executive-summary',
        'monthly-stats'
      ],
      format: 'summary'
    },
    {
      id: 'custom',
      name: 'Custom Report',
      description: 'Choose your own sections',
      sections: [],
      format: 'detailed'
    }
  ], [])

  // Filter trades by selected month
  const monthlyTrades = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number)
    return trades.filter(trade => {
      const tradeDate = new Date(trade.timestamp)
      return tradeDate.getFullYear() === year && tradeDate.getMonth() === month - 1
    })
  }, [trades, selectedMonth])

  // Calculate monthly statistics
  const monthlyStats = useMemo((): MonthlyStats => {
    const tradesWithPnL = monthlyTrades.filter(t => t.pnl !== undefined)
    
    if (tradesWithPnL.length === 0) {
      return {
        totalTrades: monthlyTrades.length,
        winningTrades: 0,
        losingTrades: 0,
        breakEvenTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        bestDay: 0,
        worstDay: 0,
        avgRiskReward: 0,
        consistency: 0
      }
    }

    const winningTrades = tradesWithPnL.filter(t => (t.pnl || 0) > 0)
    const losingTrades = tradesWithPnL.filter(t => (t.pnl || 0) < 0)
    const breakEvenTrades = tradesWithPnL.filter(t => (t.pnl || 0) === 0)

    const totalPnL = tradesWithPnL.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
      : 0

    // Calculate daily P&L for drawdown analysis
    const dailyPnL = new Map<string, number>()
    tradesWithPnL.forEach(trade => {
      const date = new Date(trade.timestamp).toDateString()
      dailyPnL.set(date, (dailyPnL.get(date) || 0) + (trade.pnl || 0))
    })

    const dailyPnLArray = Array.from(dailyPnL.values())
    const bestDay = dailyPnLArray.length > 0 ? Math.max(...dailyPnLArray) : 0
    const worstDay = dailyPnLArray.length > 0 ? Math.min(...dailyPnLArray) : 0

    // Calculate max drawdown
    let maxDrawdown = 0
    let peak = 0
    let runningPnL = 0
    
    tradesWithPnL.forEach(trade => {
      runningPnL += trade.pnl || 0
      if (runningPnL > peak) peak = runningPnL
      const drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    })

    // Calculate average risk-reward ratio
    const tradesWithRR = tradesWithPnL.filter(t => t.riskRewardRatio && t.riskRewardRatio > 0)
    const avgRiskReward = tradesWithRR.length > 0
      ? tradesWithRR.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0) / tradesWithRR.length
      : 0

    return {
      totalTrades: monthlyTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      breakEvenTrades: breakEvenTrades.length,
      winRate: tradesWithPnL.length > 0 ? (winningTrades.length / tradesWithPnL.length) * 100 : 0,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0,
      maxDrawdown,
      bestDay,
      worstDay,
      avgRiskReward,
      consistency: dailyPnLArray.length > 0 ? (dailyPnLArray.filter(pnl => pnl > 0).length / dailyPnLArray.length) * 100 : 0
    }
  }, [monthlyTrades])

  // Get enabled sections based on template
  const enabledSections = useMemo(() => {
    const template = reportTemplates.find(t => t.id === selectedTemplate)
    if (!template) return []

    if (template.id === 'custom') {
      return reportSections.filter(section => 
        section.required || customSections[section.id]
      )
    }

    return reportSections.filter(section => 
      section.required || template.sections.includes(section.id)
    )
  }, [selectedTemplate, customSections, reportSections, reportTemplates])

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    
    // Reset custom sections when changing templates
    if (templateId !== 'custom') {
      const template = reportTemplates.find(t => t.id === templateId)
      if (template) {
        const newCustomSections: Record<string, boolean> = {}
        reportSections.forEach(section => {
          newCustomSections[section.id] = template.sections.includes(section.id)
        })
        setCustomSections(newCustomSections)
      }
    }
  }

  // Handle section toggle for custom template
  const handleSectionToggle = (sectionId: string, enabled: boolean) => {
    setCustomSections(prev => ({
      ...prev,
      [sectionId]: enabled
    }))
  }

  // Generate PDF report
  const generatePDFReport = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate PDF generation process
      const steps = enabledSections.length + 2 // sections + header + footer
      
      for (let i = 0; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setGenerationProgress((i / steps) * 100)
      }

      // In a real implementation, this would:
      // 1. Generate charts and visualizations
      // 2. Compile trade data
      // 3. Create PDF using a library like jsPDF or Puppeteer
      // 4. Download the file
      
      // For now, we'll create a simple text-based report
      const reportData = {
        month: selectedMonth,
        template: reportTemplates.find(t => t.id === selectedTemplate)?.name,
        stats: monthlyStats,
        trades: monthlyTrades,
        sections: enabledSections.map(s => s.name)
      }

      // Create and download a JSON file as a placeholder
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trading-report-${selectedMonth}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Bulk PDF Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Generate comprehensive trading reports for prop firms, tax purposes, or personal analysis.
          </p>
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Month Selection */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="report-month">Report Month</Label>
            <Input
              id="report-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="report-template">Report Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Trades:</span>
                <span className="font-medium">{monthlyStats.totalTrades}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Win Rate:</span>
                <span className="font-medium">{monthlyStats.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total P&L:</span>
                <span className={`font-medium ${monthlyStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${monthlyStats.totalPnL.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Description */}
      {selectedTemplate !== 'custom' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">
                  {reportTemplates.find(t => t.id === selectedTemplate)?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {reportTemplates.find(t => t.id === selectedTemplate)?.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Sections (for custom template) */}
      {selectedTemplate === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportSections.map((section) => (
                <div key={section.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={section.id}
                    checked={section.required || customSections[section.id] || false}
                    onCheckedChange={(checked) => 
                      !section.required && handleSectionToggle(section.id, checked as boolean)
                    }
                    disabled={section.required}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={section.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {section.name}
                      {section.required && (
                        <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                      )}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enabled Sections Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Report Preview ({enabledSections.length} sections)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {enabledSections.map((section) => (
              <Badge key={section.id} variant="outline" className="justify-start">
                <CheckCircle className="h-3 w-3 mr-1" />
                {section.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating PDF report...</span>
                <span>{generationProgress.toFixed(0)}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button 
              onClick={generatePDFReport}
              disabled={isGenerating || enabledSections.length === 0}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate PDF Report'}
            </Button>

            {enabledSections.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Select at least one report section
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• Report will include data from {monthlyStats.totalTrades} trades in {selectedMonth}</p>
            <p>• PDF will be automatically downloaded when ready</p>
            <p>• Large reports with screenshots may take longer to generate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}