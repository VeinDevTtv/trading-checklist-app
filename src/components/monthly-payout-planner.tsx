"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calculator,
  PiggyBank,
  Zap,
  Settings,
  Plus,
  Save,
  Trash2
} from "lucide-react"

interface PropFirmRule {
  name: string
  maxDailyLoss: number // percentage
  maxTotalLoss: number // percentage
  profitTarget: number // percentage
  minTradingDays: number
  maxTradingDays: number
  consistencyRule?: string
  accountSizes: number[] // Available account sizes
}

interface CustomPropFirm extends PropFirmRule {
  id: string
  isCustom: true
}

interface PayoutPlan {
  targetDate: string
  currentBalance: number
  propFirm: string
  dailyRiskBudget: number
  requiredDailyProfit: number
  tradingDaysRemaining: number
  successProbability: number
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
  profitTarget: number // The actual profit target amount based on prop firm rules
  profitTargetPercentage: number // The percentage target
  remainingProfitNeeded: number // How much more profit is needed
  isTargetReached: boolean // Whether the profit target is already reached
}

interface MonthlyPayoutPlannerProps {
  currentBalance?: number
  onPlanUpdate?: (plan: PayoutPlan) => void
}

export function MonthlyPayoutPlanner({ currentBalance: initialBalance, onPlanUpdate }: MonthlyPayoutPlannerProps) {
  const [targetDate, setTargetDate] = useState<string>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().split('T')[0]
  })
  const [selectedPropFirm, setSelectedPropFirm] = useState<string>('ftmo')
  const [currentBalance, setCurrentBalance] = useState<number>(initialBalance || 10000)
  const [selectedAccountSize, setSelectedAccountSize] = useState<number>(10000)
  const [customPropFirms, setCustomPropFirms] = useState<CustomPropFirm[]>([])
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false)
  const [editingCustomFirm, setEditingCustomFirm] = useState<string | null>(null)

  // Custom firm form state
  const [customForm, setCustomForm] = useState({
    name: '',
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    profitTarget: 8,
    minTradingDays: 5,
    maxTradingDays: 30,
    consistencyRule: '',
    accountSizes: '10000,25000,50000,100000'
  })

  // Load custom prop firms from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customPropFirms')
    if (saved) {
      try {
        setCustomPropFirms(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load custom prop firms:', error)
      }
    }
  }, [])

  // Save custom prop firms to localStorage whenever they change
  useEffect(() => {
    if (customPropFirms.length > 0) {
      localStorage.setItem('customPropFirms', JSON.stringify(customPropFirms))
    }
  }, [customPropFirms])

  // Built-in prop firm rules database
  const builtInPropFirmRules: Record<string, PropFirmRule> = useMemo(() => ({
    ftmo: {
      name: 'FTMO',
      maxDailyLoss: 5,
      maxTotalLoss: 10,
      profitTarget: 10,
      minTradingDays: 10,
      maxTradingDays: 30,
      consistencyRule: 'No single day > 50% of total profit',
      accountSizes: [10000, 25000, 50000, 100000, 200000]
    },
    fundednext: {
      name: 'FundedNext',
      maxDailyLoss: 5,
      maxTotalLoss: 12,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30,
      consistencyRule: 'No single day > 40% of total profit',
      accountSizes: [6000, 15000, 25000, 50000, 100000, 200000]
    },
    myforexfunds: {
      name: 'MyForexFunds',
      maxDailyLoss: 5,
      maxTotalLoss: 12,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30,
      accountSizes: [5000, 10000, 25000, 50000, 100000, 200000]
    },
    thefundedtrader: {
      name: 'The Funded Trader',
      maxDailyLoss: 4,
      maxTotalLoss: 8,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30,
      accountSizes: [5000, 15000, 25000, 50000, 100000, 200000, 400000]
    },
    apex: {
      name: 'Apex Trader Funding',
      maxDailyLoss: 3,
      maxTotalLoss: 6,
      profitTarget: 8,
      minTradingDays: 10,
      maxTradingDays: 30,
      accountSizes: [25000, 50000, 75000, 100000, 150000, 250000]
    },
    fundingpips: {
      name: 'FundingPips',
      maxDailyLoss: 5,
      maxTotalLoss: 10,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30,
      consistencyRule: 'No single day > 50% of total profit',
      accountSizes: [10000, 25000, 50000, 100000, 200000]
    },
    goatfundedtrader: {
      name: 'Goat Funded Trader',
      maxDailyLoss: 5,
      maxTotalLoss: 10,
      profitTarget: 8,
      minTradingDays: 4,
      maxTradingDays: 30,
      consistencyRule: 'No single day > 30% of total profit',
      accountSizes: [5000, 10000, 25000, 50000, 100000, 200000]
    },
    topstep: {
      name: 'TopStep',
      maxDailyLoss: 3,
      maxTotalLoss: 6,
      profitTarget: 6,
      minTradingDays: 8,
      maxTradingDays: 30,
      consistencyRule: 'No single day > 50% of total profit',
      accountSizes: [25000, 50000, 100000, 150000]
    },
    lux: {
      name: 'Lux Trading Firm',
      maxDailyLoss: 5,
      maxTotalLoss: 10,
      profitTarget: 8,
      minTradingDays: 3,
      maxTradingDays: 30,
      accountSizes: [10000, 25000, 50000, 100000, 200000]
    },
    e8: {
      name: 'E8 Markets',
      maxDailyLoss: 5,
      maxTotalLoss: 8,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30,
      consistencyRule: 'No single day > 25% of total profit',
      accountSizes: [25000, 50000, 100000, 200000]
    }
  }), [])

  // Combined prop firm rules (built-in + custom)
  const propFirmRules = useMemo(() => {
    const combined: Record<string, PropFirmRule> = { ...builtInPropFirmRules }
    
    customPropFirms.forEach(firm => {
      combined[firm.id] = firm
    })
    
    return combined
  }, [builtInPropFirmRules, customPropFirms])

  // Handle custom form submission
  const handleSaveCustomFirm = () => {
    if (!customForm.name.trim()) return

    const accountSizes = customForm.accountSizes
      .split(',')
      .map(size => parseInt(size.trim()))
      .filter(size => !isNaN(size) && size > 0)
      .sort((a, b) => a - b)

    if (accountSizes.length === 0) {
      alert('Please enter at least one valid account size')
      return
    }

    const newFirm: CustomPropFirm = {
      id: editingCustomFirm || `custom_${Date.now()}`,
      name: customForm.name,
      maxDailyLoss: customForm.maxDailyLoss,
      maxTotalLoss: customForm.maxTotalLoss,
      profitTarget: customForm.profitTarget,
      minTradingDays: customForm.minTradingDays,
      maxTradingDays: customForm.maxTradingDays,
      consistencyRule: customForm.consistencyRule || undefined,
      accountSizes,
      isCustom: true
    }

    if (editingCustomFirm) {
      // Update existing
      setCustomPropFirms(prev => prev.map(firm => 
        firm.id === editingCustomFirm ? newFirm : firm
      ))
    } else {
      // Add new
      setCustomPropFirms(prev => [...prev, newFirm])
    }

    // Reset form
    setCustomForm({
      name: '',
      maxDailyLoss: 5,
      maxTotalLoss: 10,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30,
      consistencyRule: '',
      accountSizes: '10000,25000,50000,100000'
    })
    setShowCustomForm(false)
    setEditingCustomFirm(null)

    // Select the new/updated firm
    setSelectedPropFirm(newFirm.id)
  }

  // Handle editing custom firm
  const handleEditCustomFirm = (firmId: string) => {
    const firm = customPropFirms.find(f => f.id === firmId)
    if (!firm) return

    setCustomForm({
      name: firm.name,
      maxDailyLoss: firm.maxDailyLoss,
      maxTotalLoss: firm.maxTotalLoss,
      profitTarget: firm.profitTarget,
      minTradingDays: firm.minTradingDays,
      maxTradingDays: firm.maxTradingDays,
      consistencyRule: firm.consistencyRule || '',
      accountSizes: firm.accountSizes.join(',')
    })
    setEditingCustomFirm(firmId)
    setShowCustomForm(true)
  }

  // Handle deleting custom firm
  const handleDeleteCustomFirm = (firmId: string) => {
    if (confirm('Are you sure you want to delete this custom prop firm?')) {
      setCustomPropFirms(prev => prev.filter(firm => firm.id !== firmId))
      if (selectedPropFirm === firmId) {
        setSelectedPropFirm('ftmo')
      }
    }
  }

  // Update account size when prop firm changes
  useEffect(() => {
    const rules = propFirmRules[selectedPropFirm]
    if (rules && !rules.accountSizes.includes(selectedAccountSize)) {
      const newSize = rules.accountSizes[0]
      setSelectedAccountSize(newSize)
      setCurrentBalance(newSize)
    }
  }, [selectedPropFirm, selectedAccountSize, propFirmRules])

  // Calculate payout plan
  const payoutPlan = useMemo((): PayoutPlan => {
    const rules = propFirmRules[selectedPropFirm]
    const today = new Date()
    const target = new Date(targetDate)
    
    // Calculate trading days (excluding weekends)
    let tradingDaysRemaining = 0
    const currentDate = new Date(today)
    while (currentDate <= target) {
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        tradingDaysRemaining++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Ensure minimum trading days
    tradingDaysRemaining = Math.max(tradingDaysRemaining, rules.minTradingDays)

    // Calculate profit target based on prop firm rules
    const profitTarget = selectedAccountSize * (rules.profitTarget / 100)
    const profitTargetPercentage = rules.profitTarget
    
    // Calculate how much profit is still needed
    const currentProfit = currentBalance - selectedAccountSize
    const remainingProfitNeeded = Math.max(0, profitTarget - currentProfit)
    const isTargetReached = currentProfit >= profitTarget

    // Calculate required daily profit to reach target
    const requiredDailyProfit = isTargetReached ? 0 : remainingProfitNeeded / tradingDaysRemaining

    // Calculate daily risk budget (conservative approach)
    const maxDailyLossAmount = currentBalance * (rules.maxDailyLoss / 100)
    
    // Use a more realistic risk budget calculation
    let dailyRiskBudget: number
    if (isTargetReached) {
      // If target is reached, use minimal risk for maintenance
      dailyRiskBudget = maxDailyLossAmount * 0.25
    } else {
      // Calculate based on required daily profit with proper risk-reward ratio
      const conservativeRiskBudget = maxDailyLossAmount * 0.6 // 60% of max allowed loss
      const profitBasedRisk = requiredDailyProfit * 1.5 // Risk 1.5x the required profit (1:1.5 RR minimum)
      dailyRiskBudget = Math.min(conservativeRiskBudget, profitBasedRisk)
    }

    // Calculate success probability based on various factors
    let successProbability = 100
    
    if (isTargetReached) {
      successProbability = 95 // High probability if already at target
    } else {
      // Factor 1: Time pressure
      if (tradingDaysRemaining < rules.minTradingDays) successProbability -= 40
      else if (tradingDaysRemaining < 10) successProbability -= 25
      else if (tradingDaysRemaining < 15) successProbability -= 15
      
      // Factor 2: Daily profit requirement vs account size
      const dailyProfitPercentage = (requiredDailyProfit / selectedAccountSize) * 100
      if (dailyProfitPercentage > 2) successProbability -= 35
      else if (dailyProfitPercentage > 1.5) successProbability -= 25
      else if (dailyProfitPercentage > 1) successProbability -= 15
      else if (dailyProfitPercentage > 0.5) successProbability -= 10
      
      // Factor 3: Risk budget vs daily loss limit
      const riskPercentage = (dailyRiskBudget / currentBalance) * 100
      if (riskPercentage > rules.maxDailyLoss * 0.8) successProbability -= 25
      
      // Factor 4: Consistency requirements
      if (rules.consistencyRule && dailyProfitPercentage > 1) successProbability -= 15

      // Factor 5: How close to max loss limit
      const totalLossFromStart = ((selectedAccountSize - currentBalance) / selectedAccountSize) * 100
      if (totalLossFromStart > rules.maxTotalLoss * 0.7) successProbability -= 20
    }

    successProbability = Math.max(5, Math.min(100, successProbability))

    // Determine risk level
    let riskLevel: PayoutPlan['riskLevel'] = 'low'
    if (isTargetReached) {
      riskLevel = 'low'
    } else {
      const dailyProfitPercentage = (requiredDailyProfit / selectedAccountSize) * 100
      if (dailyProfitPercentage > 1.5 || successProbability < 40) riskLevel = 'extreme'
      else if (dailyProfitPercentage > 1 || successProbability < 60) riskLevel = 'high'
      else if (dailyProfitPercentage > 0.5 || successProbability < 80) riskLevel = 'medium'
    }

    return {
      targetDate,
      currentBalance,
      propFirm: rules.name,
      dailyRiskBudget,
      requiredDailyProfit,
      tradingDaysRemaining,
      successProbability,
      riskLevel,
      profitTarget,
      profitTargetPercentage,
      remainingProfitNeeded,
      isTargetReached
    }
  }, [targetDate, currentBalance, selectedPropFirm, propFirmRules, selectedAccountSize])

  // Update parent component when plan changes
  useEffect(() => {
    onPlanUpdate?.(payoutPlan)
  }, [payoutPlan, onPlanUpdate])

  const getRiskLevelColor = (level: PayoutPlan['riskLevel']) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'extreme': return 'text-red-600 bg-red-100'
    }
  }

  const getRiskLevelIcon = (level: PayoutPlan['riskLevel']) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'extreme': return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-green-600" />
            Monthly Payout Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Plan your trading strategy to meet prop firm payout requirements while respecting risk management rules.
          </p>
        </CardContent>
      </Card>

      {/* Account Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prop-firm">Prop Firm</Label>
                <div className="flex gap-2">
                  <Select value={selectedPropFirm} onValueChange={setSelectedPropFirm}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom-header" disabled className="font-semibold">
                        Built-in Firms
                      </SelectItem>
                      {Object.entries(builtInPropFirmRules).map(([key, rule]) => (
                        <SelectItem key={key} value={key}>
                          {rule.name}
                        </SelectItem>
                      ))}
                      {customPropFirms.length > 0 && (
                        <>
                          <SelectItem value="custom-firms-header" disabled className="font-semibold">
                            Custom Firms
                          </SelectItem>
                          {customPropFirms.map((firm) => (
                            <SelectItem key={firm.id} value={firm.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{firm.name}</span>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditCustomFirm(firm.id)
                                    }}
                                  >
                                    <Settings className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0 text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteCustomFirm(firm.id)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCustomForm(true)}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-size">Account Size</Label>
                <Select 
                  value={selectedAccountSize.toString()} 
                  onValueChange={(value) => {
                    const size = Number(value)
                    setSelectedAccountSize(size)
                    setCurrentBalance(size)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propFirmRules[selectedPropFirm].accountSizes.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        ${size.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-balance">Current Balance</Label>
                <Input
                  id="current-balance"
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(Number(e.target.value))}
                  min={0}
                  max={selectedAccountSize}
                />
              </div>
            </div>

            {/* Custom Prop Firm Form */}
            {showCustomForm && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingCustomFirm ? 'Edit Custom Prop Firm' : 'Add Custom Prop Firm'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-name">Firm Name</Label>
                      <Input
                        id="custom-name"
                        value={customForm.name}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., My Prop Firm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-account-sizes">Account Sizes (comma-separated)</Label>
                      <Input
                        id="custom-account-sizes"
                        value={customForm.accountSizes}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, accountSizes: e.target.value }))}
                        placeholder="10000,25000,50000,100000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-max-daily-loss">Max Daily Loss (%)</Label>
                      <Input
                        id="custom-max-daily-loss"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={customForm.maxDailyLoss}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, maxDailyLoss: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-max-total-loss">Max Total Loss (%)</Label>
                      <Input
                        id="custom-max-total-loss"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={customForm.maxTotalLoss}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, maxTotalLoss: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-profit-target">Profit Target (%)</Label>
                      <Input
                        id="custom-profit-target"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={customForm.profitTarget}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, profitTarget: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-min-trading-days">Min Trading Days</Label>
                      <Input
                        id="custom-min-trading-days"
                        type="number"
                        min="1"
                        value={customForm.minTradingDays}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, minTradingDays: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-max-trading-days">Max Trading Days</Label>
                      <Input
                        id="custom-max-trading-days"
                        type="number"
                        min="1"
                        value={customForm.maxTradingDays}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, maxTradingDays: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="custom-consistency-rule">Consistency Rule (optional)</Label>
                      <Textarea
                        id="custom-consistency-rule"
                        value={customForm.consistencyRule}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, consistencyRule: e.target.value }))}
                        placeholder="e.g., No single day > 50% of total profit"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSaveCustomFirm} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {editingCustomFirm ? 'Update' : 'Save'} Custom Firm
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowCustomForm(false)
                        setEditingCustomFirm(null)
                        setCustomForm({
                          name: '',
                          maxDailyLoss: 5,
                          maxTotalLoss: 10,
                          profitTarget: 8,
                          minTradingDays: 5,
                          maxTradingDays: 30,
                          consistencyRule: '',
                          accountSizes: '10000,25000,50000,100000'
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Challenge Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-date">Target Completion Date</Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Profit Target</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Required:</span>
                  <span className="font-semibold">
                    ${payoutPlan.profitTarget.toFixed(0)} ({payoutPlan.profitTargetPercentage}%)
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">Remaining:</span>
                  <span className={`font-semibold ${payoutPlan.isTargetReached ? 'text-green-600' : 'text-orange-600'}`}>
                    {payoutPlan.isTargetReached ? 'Target Reached! 🎉' : `$${payoutPlan.remainingProfitNeeded.toFixed(0)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Required Daily Profit */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {payoutPlan.isTargetReached ? 'Daily Maintenance' : 'Daily Profit Needed'}
                </p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <DollarSign className={`h-5 w-5 ${payoutPlan.isTargetReached ? 'text-blue-500' : 'text-green-500'}`} />
                  {payoutPlan.isTargetReached ? 'Target Met' : `$${payoutPlan.requiredDailyProfit.toFixed(0)}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {payoutPlan.isTargetReached ? '0.0%' : `${((payoutPlan.requiredDailyProfit / selectedAccountSize) * 100).toFixed(2)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Risk Budget */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Risk Budget</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Target className="h-5 w-5 text-blue-500" />
                  ${payoutPlan.dailyRiskBudget.toFixed(0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {((payoutPlan.dailyRiskBudget / currentBalance) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Days Remaining */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trading Days Left</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  {payoutPlan.tradingDaysRemaining}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Min: {propFirmRules[selectedPropFirm].minTradingDays}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Probability */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Probability</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  {payoutPlan.successProbability.toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <Progress value={payoutPlan.successProbability} className="w-16 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Risk Level Badge */}
            <div className="flex items-center gap-2">
              <Badge className={`${getRiskLevelColor(payoutPlan.riskLevel)} flex items-center gap-1`}>
                {getRiskLevelIcon(payoutPlan.riskLevel)}
                {payoutPlan.riskLevel.toUpperCase()} RISK
              </Badge>
              <span className="text-sm text-muted-foreground">
                Based on {propFirmRules[selectedPropFirm].name} rules and market conditions
              </span>
            </div>

            {/* Prop Firm Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{propFirmRules[selectedPropFirm].name} Limits</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Max Daily Loss:</span>
                    <span className="font-medium">{propFirmRules[selectedPropFirm].maxDailyLoss}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Total Loss:</span>
                    <span className="font-medium">{propFirmRules[selectedPropFirm].maxTotalLoss}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Target:</span>
                    <span className="font-medium">{propFirmRules[selectedPropFirm].profitTarget}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Trading Days:</span>
                    <span className="font-medium">{propFirmRules[selectedPropFirm].minTradingDays}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Your Progress</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Current Profit:</span>
                    <span className={`font-medium ${(currentBalance - selectedAccountSize) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(currentBalance - selectedAccountSize).toFixed(0)} ({(((currentBalance - selectedAccountSize) / selectedAccountSize) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Risk Budget:</span>
                    <span className="font-medium">
                      ${payoutPlan.dailyRiskBudget.toFixed(0)} ({((payoutPlan.dailyRiskBudget / currentBalance) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Profit Target:</span>
                    <span className="font-medium">
                      {payoutPlan.isTargetReached ? 'Maintenance Mode' : `$${payoutPlan.requiredDailyProfit.toFixed(0)} (${((payoutPlan.requiredDailyProfit / selectedAccountSize) * 100).toFixed(2)}%)`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk:Reward Ratio:</span>
                    <span className="font-medium">
                      {payoutPlan.isTargetReached ? 'Conservative' : `1:${(payoutPlan.requiredDailyProfit / payoutPlan.dailyRiskBudget).toFixed(1)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consistency Rule */}
            {propFirmRules[selectedPropFirm].consistencyRule && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Consistency Rule</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {propFirmRules[selectedPropFirm].consistencyRule}
                </p>
              </div>
            )}

            {/* Recommendations */}
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Recommendations
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {payoutPlan.isTargetReached ? (
                  <>
                    <p className="text-green-600">🎉 Congratulations! You&apos;ve reached your profit target!</p>
                    <p>• Focus on maintaining your gains and avoiding unnecessary risks</p>
                    <p>• Consider reducing position sizes to preserve your progress</p>
                    <p>• Complete the minimum trading days requirement: {propFirmRules[selectedPropFirm].minTradingDays} days</p>
                  </>
                ) : (
                  <>
                    {payoutPlan.riskLevel === 'extreme' && (
                      <p className="text-red-600">⚠️ Extremely challenging target. Consider extending your timeline.</p>
                    )}
                    {payoutPlan.riskLevel === 'high' && (
                      <p className="text-orange-600">⚠️ Aggressive target. Focus on high-probability setups only.</p>
                    )}
                    {payoutPlan.successProbability < 70 && (
                      <p>• Consider extending your target date to improve success probability</p>
                    )}
                    {((payoutPlan.requiredDailyProfit / selectedAccountSize) * 100) > 1 && (
                      <p>• Daily profit target is ambitious. Focus on quality over quantity.</p>
                    )}
                    {payoutPlan.tradingDaysRemaining < 15 && (
                      <p>• Limited time remaining. Avoid overtrading and stick to your best setups.</p>
                    )}
                    <p>• Maintain strict risk management: never exceed ${payoutPlan.dailyRiskBudget.toFixed(0)} daily risk</p>
                    <p>• You need ${payoutPlan.remainingProfitNeeded.toFixed(0)} more profit to reach the {payoutPlan.profitTargetPercentage}% target</p>
                  </>
                )}
                <p>• Track your progress daily and adjust if needed</p>
                <p>• Respect the consistency rule: {propFirmRules[selectedPropFirm].consistencyRule || 'No specific consistency requirements'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
