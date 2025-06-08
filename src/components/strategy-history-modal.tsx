"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  History, 
  RotateCcw, 
  Plus, 
  Minus, 
  Edit, 
  Clock,
  GitBranch
} from "lucide-react"
import { StrategyVersionManager, StrategyRevision } from "@/lib/strategy-versioning"

interface Condition {
  id: number
  text: string
  importance: 'high' | 'medium' | 'low'
}

interface StrategyHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategyId: string
  strategyName: string
  onRestore: (strategyData: StrategyRevision['data']) => void
}

export function StrategyHistoryModal({
  open,
  onOpenChange,
  strategyId,
  strategyName,
  onRestore
}: StrategyHistoryModalProps) {
  const [revisions, setRevisions] = useState<StrategyRevision[]>([])
  const [selectedRevision, setSelectedRevision] = useState<StrategyRevision | null>(null)
  const [compareRevision, setCompareRevision] = useState<StrategyRevision | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && strategyId) {
      loadRevisions()
    }
  }, [open, strategyId])

  const loadRevisions = async () => {
    setLoading(true)
    try {
      const history = await StrategyVersionManager.getRevisionHistory(strategyId)
      setRevisions(history)
      if (history.length > 0) {
        setSelectedRevision(history[0]) // Most recent
      }
    } catch (error) {
      console.error('Failed to load revision history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (revision: StrategyRevision) => {
    if (confirm(`Are you sure you want to restore "${strategyName}" to this revision from ${new Date(revision.timestamp).toLocaleString()}?`)) {
      try {
        const restoredData = await StrategyVersionManager.restoreRevision(strategyId, revision.revisionId)
        if (restoredData) {
          onRestore(restoredData)
          onOpenChange(false)
        }
      } catch (error) {
        console.error('Failed to restore revision:', error)
        alert('Failed to restore revision. Please try again.')
      }
    }
  }

  const generateDiff = () => {
    if (!selectedRevision || !compareRevision) return []
    return StrategyVersionManager.generateDiff(compareRevision.data, selectedRevision.data)
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(timestamp)
    }
  }

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 30) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-red-500 text-red-600'
      case 'medium': return 'border-orange-500 text-orange-600'
      case 'low': return 'border-yellow-500 text-yellow-600'
      default: return 'border-gray-500 text-gray-600'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Strategy History: {strategyName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[70vh]">
          {/* Revision List */}
          <div className="w-1/3 border-r pr-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Revisions ({revisions.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRevisions}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-full">
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading revisions...
                  </div>
                ) : revisions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No revision history found
                  </div>
                ) : (
                  revisions.map((revision, index) => {
                    const timestamp = formatTimestamp(revision.timestamp)
                    const isSelected = selectedRevision?.revisionId === revision.revisionId
                    const isCompare = compareRevision?.revisionId === revision.revisionId

                    return (
                      <Card 
                        key={revision.revisionId}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        } ${isCompare ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                        onClick={() => setSelectedRevision(revision)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              {index === 0 ? "Current" : `Rev ${revisions.length - index}`}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {timestamp.relative}
                            </span>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <div className="font-medium truncate">
                              {revision.data.name}
                            </div>
                            <div className="text-muted-foreground">
                              {revision.data.conditions.length} conditions
                            </div>
                            {revision.changeDescription && (
                              <div className="text-xs italic text-muted-foreground">
                                {revision.changeDescription}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCompareRevision(compareRevision?.revisionId === revision.revisionId ? null : revision)
                              }}
                              className="text-xs"
                            >
                              <GitBranch className="h-3 w-3 mr-1" />
                              {isCompare ? 'Uncompare' : 'Compare'}
                            </Button>
                            
                            {index > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRestore(revision)
                                }}
                                className="text-xs"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restore
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Revision Details */}
          <div className="flex-1">
            {selectedRevision ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{selectedRevision.data.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatTimestamp(selectedRevision.timestamp).date} at {formatTimestamp(selectedRevision.timestamp).time}
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  {compareRevision ? (
                    // Diff View
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">Comparing</Badge>
                        <span className="text-sm">
                          {compareRevision.data.name} → {selectedRevision.data.name}
                        </span>
                      </div>

                      {generateDiff().map((change, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {change.type === 'added' && <Plus className="h-4 w-4 text-green-600" />}
                              {change.type === 'removed' && <Minus className="h-4 w-4 text-red-600" />}
                              {change.type === 'modified' && <Edit className="h-4 w-4 text-blue-600" />}
                              {change.type === 'name_changed' && <Edit className="h-4 w-4 text-purple-600" />}
                              
                              <Badge variant="outline" className="text-xs">
                                {change.type.replace('_', ' ')}
                              </Badge>
                            </div>

                            {change.type === 'name_changed' && (
                              <div className="space-y-1">
                                <div className="text-sm text-red-600 line-through">
                                  {change.oldValue as string}
                                </div>
                                <div className="text-sm text-green-600">
                                  {change.newValue as string}
                                </div>
                              </div>
                            )}

                            {change.field === 'condition' && (
                              <div className="space-y-1">
                                {change.oldValue && (
                                  <div className="text-sm text-red-600 line-through">
                                    {(change.oldValue as Condition).text} 
                                    <Badge variant="outline" className={`ml-2 text-xs ${getImportanceColor((change.oldValue as Condition).importance)}`}>
                                      {(change.oldValue as Condition).importance}
                                    </Badge>
                                  </div>
                                )}
                                {change.newValue && (
                                  <div className="text-sm text-green-600">
                                    {(change.newValue as Condition).text}
                                    <Badge variant="outline" className={`ml-2 text-xs ${getImportanceColor((change.newValue as Condition).importance)}`}>
                                      {(change.newValue as Condition).importance}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}

                      {generateDiff().length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No differences found between these revisions
                        </div>
                      )}
                    </div>
                  ) : (
                    // Single Revision View
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Conditions ({selectedRevision.data.conditions.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {selectedRevision.data.conditions.map((condition) => (
                            <div key={condition.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                              <span className="text-sm font-medium">{condition.text}</span>
                              <Badge variant="outline" className={`text-xs ${getImportanceColor(condition.importance)}`}>
                                {condition.importance}
                              </Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {selectedRevision.changeDescription && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Change Description</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground italic">
                              {selectedRevision.changeDescription}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a revision to view details
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 