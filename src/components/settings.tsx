"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Upload,
  Trash2,
  Save
} from "lucide-react"

interface AppSettings {
  notifications: boolean
  autoSave: boolean
  defaultRiskPercentage: number
  defaultAccountBalance: number
  showRiskWarnings: boolean
  compactMode: boolean
  exportFormat: 'pdf' | 'json'
  maxHistoryItems: number
}

const defaultSettings: AppSettings = {
  notifications: true,
  autoSave: true,
  defaultRiskPercentage: 2,
  defaultAccountBalance: 10000,
  showRiskWarnings: true,
  compactMode: false,
  exportFormat: 'pdf',
  maxHistoryItems: 100
}

const SETTINGS_STORAGE_KEY = 'trading-checklist-settings'

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      }
    } catch (error) {
      console.warn('Failed to load settings:', error)
    }
  }

  const saveSettings = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
      setHasChanges(false)
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }
  }

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings(defaultSettings)
      setHasChanges(true)
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'trading-checklist-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setSettings({ ...defaultSettings, ...imported })
        setHasChanges(true)
             } catch {
         alert('Invalid settings file')
       }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="animate-pulse">
            Unsaved Changes
          </Badge>
        )}
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save your progress
              </p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting('autoSave', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use a more compact layout
              </p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSetting('compactMode', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-history">Maximum History Items</Label>
            <Input
              id="max-history"
              type="number"
              value={settings.maxHistoryItems}
              onChange={(e) => updateSetting('maxHistoryItems', Number(e.target.value))}
              min={10}
              max={1000}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Risk Warnings</Label>
              <p className="text-sm text-muted-foreground">
                Display warnings for high-risk trades
              </p>
            </div>
            <Switch
              checked={settings.showRiskWarnings}
              onCheckedChange={(checked) => updateSetting('showRiskWarnings', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-risk">Default Risk Percentage (%)</Label>
            <Input
              id="default-risk"
              type="number"
              value={settings.defaultRiskPercentage}
              onChange={(e) => updateSetting('defaultRiskPercentage', Number(e.target.value))}
              min={0.1}
              max={10}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-balance">Default Account Balance ($)</Label>
            <Input
              id="default-balance"
              type="number"
              value={settings.defaultAccountBalance}
              onChange={(e) => updateSetting('defaultAccountBalance', Number(e.target.value))}
              min={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about important events
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportSettings} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="import-settings" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </label>
            </Button>
            <input
              id="import-settings"
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />

            <Button onClick={resetSettings} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings} 
          disabled={!hasChanges}
          className="min-w-[120px]"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
} 