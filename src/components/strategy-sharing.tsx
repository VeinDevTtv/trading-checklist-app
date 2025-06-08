"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Share2, 
  Download, 
  Upload, 
  Copy, 
  Link, 
  FileText,
  Check,
  AlertCircle,
  Info
} from "lucide-react"
import { StrategySharing, ShareableStrategy, ShareResult, ImportResult } from "@/lib/strategy-sharing"

interface Strategy {
  id: string;
  name: string;
  conditions: Array<{
    id: number;
    text: string;
    importance: 'high' | 'medium' | 'low';
  }>;
}

interface StrategySharingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategy: Strategy
  onImportStrategy?: (strategy: Strategy) => void
}

export function StrategySharingComponent({ 
  open, 
  onOpenChange, 
  strategy,
  onImportStrategy 
}: StrategySharingProps) {
  const [shareUrl, setShareUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    author: "",
    description: "",
    tags: ""
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const shareableStrategy: ShareableStrategy = {
    id: strategy.id,
    name: strategy.name,
    conditions: strategy.conditions,
    metadata: {
      version: "1.0.0",
      createdAt: Date.now(),
      author: metadata.author || undefined,
      description: metadata.description || undefined,
      tags: metadata.tags ? metadata.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
    }
  }

  const shareStats = StrategySharing.getShareStats(shareableStrategy)

  const handleExportJSON = () => {
    try {
      StrategySharing.exportAsJSON(shareableStrategy)
    } catch (error) {
      console.error('Export failed:', error)
      setImportError('Failed to export strategy')
    }
  }

  const handleGenerateShareUrl = () => {
    const result: ShareResult = StrategySharing.generateShareUrl(shareableStrategy)
    if (result.success && result.shareUrl) {
      setShareUrl(result.shareUrl)
      setImportError(null)
    } else {
      setImportError(result.error || 'Failed to generate share URL')
      setShareUrl("")
    }
  }

  const handleCopyUrl = async () => {
    if (!shareUrl) return
    
    const success = await StrategySharing.copyShareUrl(shareUrl)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setImportError('Failed to copy URL to clipboard')
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      const result: ImportResult = await StrategySharing.importFromJSON(file)
      if (result.success && result.strategy && onImportStrategy) {
        const importedStrategy: Strategy = {
          id: result.strategy.id,
          name: result.strategy.name,
          conditions: result.strategy.conditions
        }
        onImportStrategy(importedStrategy)
        setImportSuccess(`Successfully imported "${result.strategy.name}"`)
        setTimeout(() => {
          onOpenChange(false)
          setImportSuccess(null)
        }, 2000)
      } else {
        setImportError(result.error || 'Failed to import strategy')
      }
    } catch (error) {
      setImportError('Failed to process file')
    } finally {
      setImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlImport = () => {
    try {
      const result: ImportResult = StrategySharing.importFromShareUrl()
      if (result.success && result.strategy && onImportStrategy) {
        const importedStrategy: Strategy = {
          id: result.strategy.id,
          name: result.strategy.name,
          conditions: result.strategy.conditions
        }
        onImportStrategy(importedStrategy)
        setImportSuccess(`Successfully imported "${result.strategy.name}" from URL`)
        StrategySharing.clearShareUrl()
        setTimeout(() => {
          onOpenChange(false)
          setImportSuccess(null)
        }, 2000)
      } else {
        setImportError(result.error || 'No shared strategy found in URL')
      }
    } catch (error) {
      setImportError('Failed to import from URL')
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500'
      case 'moderate': return 'bg-yellow-500'
      case 'complex': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Strategy: {strategy.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Strategy Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strategy Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{strategy.name}</span>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {strategy.conditions.length} conditions
                  </Badge>
                  <Badge className={getComplexityColor(shareStats.complexity)}>
                    {shareStats.complexity}
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {StrategySharing.generatePreview(shareableStrategy)}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">High Priority:</span>
                  <div className="font-medium text-red-600">
                    {strategy.conditions.filter(c => c.importance === 'high').length}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Medium Priority:</span>
                  <div className="font-medium text-orange-600">
                    {strategy.conditions.filter(c => c.importance === 'medium').length}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Low Priority:</span>
                  <div className="font-medium text-yellow-600">
                    {strategy.conditions.filter(c => c.importance === 'low').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your name or username"
                  value={metadata.author}
                  onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this strategy..."
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="scalping, swing, forex, crypto (comma-separated)"
                  value={metadata.tags}
                  onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export & Share</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* JSON Export */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Download JSON File</div>
                    <div className="text-sm text-muted-foreground">
                      Save strategy as a file for backup or sharing
                    </div>
                  </div>
                </div>
                <Button onClick={handleExportJSON} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* URL Sharing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Link className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Share via URL</div>
                      <div className="text-sm text-muted-foreground">
                        Generate a shareable link (strategy embedded in URL)
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleGenerateShareUrl} 
                    variant="outline"
                    disabled={!shareStats.canShareViaUrl}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>

                {!shareStats.canShareViaUrl && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    Strategy too large for URL sharing. Use JSON export instead.
                  </div>
                )}

                {shareUrl && (
                  <div className="space-y-2">
                    <Label>Share URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={shareUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={handleCopyUrl}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Anyone with this URL can import your strategy
                    </div>
                  </div>
                )}
              </div>

              {/* Sharing Stats */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Info className="h-4 w-4" />
                <span>
                  Estimated URL length: {shareStats.estimatedUrlLength} characters • 
                  Complexity: {shareStats.complexity} • 
                  {shareStats.conditionCount} conditions
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Import Section */}
          {onImportStrategy && (
            <>
              <Separator />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Import Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Import */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Upload className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Import from JSON File</div>
                        <div className="text-sm text-muted-foreground">
                          Load a previously exported strategy file
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="outline"
                      disabled={importing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  </div>

                  {/* URL Import */}
                  {StrategySharing.hasSharedStrategy() && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center gap-3">
                        <Link className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Shared Strategy Detected</div>
                          <div className="text-sm text-muted-foreground">
                            A strategy was shared via URL
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleUrlImport} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Import from URL
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Status Messages */}
          {importError && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{importError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {importSuccess && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">{importSuccess}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  )
} 