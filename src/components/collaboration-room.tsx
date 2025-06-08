"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Send,
  Eye,
  EyeOff,
  UserPlus,
  Wifi,
  WifiOff
} from "lucide-react"
import { CollaborationProvider, CollaborationComment, CollaborationUser } from "@/lib/collaboration"

interface CollaborationRoomProps {
  checkedIds: number[]
  notes: string
  onCheckedIdsChange: (ids: number[]) => void
  onNotesChange: (notes: string) => void
  isEnabled: boolean
  onToggle: () => void
}

export function CollaborationRoom({
  checkedIds,
  notes,
  onCheckedIdsChange,
  onNotesChange,
  isEnabled,
  onToggle
}: CollaborationRoomProps) {
  const [provider, setProvider] = useState<CollaborationProvider | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [roomId, setRoomId] = useState("")
  const [userName, setUserName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [users, setUsers] = useState<CollaborationUser[]>([])
  const [comments, setComments] = useState<CollaborationComment[]>([])
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number; user: CollaborationUser }>>(new Map())
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(true)
  const [copiedRoomId, setCopiedRoomId] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const userIdRef = useRef<string>(CollaborationProvider.generateUserId())

  // Handle mouse movement for cursor tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (provider && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      provider.updateCursor(x, y)
    }
  }, [provider])

  // Set up collaboration provider
  const setupProvider = useCallback(async (roomId: string, userName: string) => {
    try {
      const newProvider = new CollaborationProvider(roomId, userIdRef.current, userName)
      
      // Set up event listeners
      newProvider.onCheckedItemsChange(onCheckedIdsChange)
      newProvider.onNotesChange(onNotesChange)
      newProvider.onCommentsChange(setComments)
      newProvider.onCursorsChange(setCursors)

      // Connect to room
      await newProvider.connect()
      
      // Sync current state
      newProvider.updateCheckedItems(checkedIds)
      newProvider.updateNotes(notes)

      setProvider(newProvider)
      setIsConnected(true)
      setUsers(newProvider.getUsers())

      // Set up mouse tracking
      if (containerRef.current) {
        containerRef.current.addEventListener('mousemove', handleMouseMove)
      }

    } catch (error) {
      console.error('Failed to connect to collaboration room:', error)
      alert('Failed to connect to collaboration room. Please try again.')
    }
  }, [checkedIds, notes, onCheckedIdsChange, onNotesChange, handleMouseMove])

  // Create new room
  const createRoom = async () => {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }

    setIsJoining(true)
    const newRoomId = CollaborationProvider.generateRoomId()
    setRoomId(newRoomId)
    await setupProvider(newRoomId, userName.trim())
    setIsJoining(false)
  }

  // Join existing room
  const joinRoom = async () => {
    if (!userName.trim() || !roomId.trim()) {
      alert('Please enter your name and room ID')
      return
    }

    setIsJoining(true)
    await setupProvider(roomId.trim(), userName.trim())
    setIsJoining(false)
  }

  // Leave room
  const leaveRoom = () => {
    if (provider) {
      provider.disconnect()
      setProvider(null)
    }
    
    if (containerRef.current) {
      containerRef.current.removeEventListener('mousemove', handleMouseMove)
    }

    setIsConnected(false)
    setUsers([])
    setComments([])
    setCursors(new Map())
    setRoomId("")
  }

  // Copy room ID to clipboard
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopiedRoomId(true)
      setTimeout(() => setCopiedRoomId(false), 2000)
    } catch (error) {
      console.error('Failed to copy room ID:', error)
    }
  }

  // Add comment
  const addComment = () => {
    if (!provider || !newComment.trim()) return

    provider.addComment(newComment.trim())
    setNewComment("")
  }

  // Resolve comment
  const resolveComment = (commentId: string) => {
    if (!provider) return
    provider.resolveComment(commentId)
  }

  // Delete comment
  const deleteComment = (commentId: string) => {
    if (!provider) return
    provider.deleteComment(commentId)
  }

  // Sync changes to collaboration provider
  useEffect(() => {
    if (provider && isConnected) {
      provider.updateCheckedItems(checkedIds)
    }
  }, [checkedIds, provider, isConnected])

  useEffect(() => {
    if (provider && isConnected) {
      provider.updateNotes(notes)
    }
  }, [notes, provider, isConnected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (provider) {
        provider.disconnect()
      }
    }
  }, [provider])

  if (!isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Real-Time Collaboration
            </div>
            <Button onClick={onToggle} variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Enable Collaboration
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable collaboration to work with mentors and other traders in real-time. 
            Share your checklist, get feedback, and see live updates as you work together.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Collaboration Room
              {isConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>
            <Button onClick={onToggle} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  disabled={isJoining}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Button 
                    onClick={createRoom} 
                    disabled={isJoining || !userName.trim()}
                    className="w-full"
                  >
                    Create New Room
                  </Button>
                </div>
                <div className="space-y-2">
                  <Input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Room ID..."
                    disabled={isJoining}
                  />
                  <Button 
                    onClick={joinRoom} 
                    disabled={isJoining || !userName.trim() || !roomId.trim()}
                    className="w-full"
                    variant="outline"
                  >
                    Join Room
                  </Button>
                </div>
              </div>

              {isJoining && (
                <div className="text-center text-sm text-muted-foreground">
                  Connecting to collaboration room...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Room Info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Room ID: {roomId}</div>
                  <div className="text-sm text-muted-foreground">
                    Share this ID with others to collaborate
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyRoomId} size="sm" variant="outline">
                    {copiedRoomId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button onClick={leaveRoom} size="sm" variant="destructive">
                    Leave Room
                  </Button>
                </div>
              </div>

              {/* Online Users */}
              <div className="space-y-2">
                <Label>Online Users ({users.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <Badge 
                      key={user.id} 
                      variant="outline" 
                      className="flex items-center gap-1"
                      style={{ borderColor: user.color }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: user.color }}
                      />
                      {user.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments ({comments.filter(c => !c.resolved).length})
              </div>
              <Button
                onClick={() => setShowComments(!showComments)}
                variant="outline"
                size="sm"
              >
                {showComments ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {showComments && (
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or feedback..."
                  className="flex-1 min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      addComment()
                    }
                  }}
                />
                <Button 
                  onClick={addComment} 
                  disabled={!newComment.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-xs">Add feedback or questions to start collaborating</p>
                  </div>
                ) : (
                  comments
                    .filter(comment => !comment.resolved)
                    .map((comment) => (
                      <div key={comment.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{comment.author}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => resolveComment(comment.id)}
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            {comment.author === userName && (
                              <Button
                                onClick={() => deleteComment(comment.id)}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0 text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))
                )}
              </div>

              {/* Resolved Comments */}
              {comments.some(c => c.resolved) && (
                <details className="space-y-2">
                  <summary className="text-sm text-muted-foreground cursor-pointer">
                    Resolved Comments ({comments.filter(c => c.resolved).length})
                  </summary>
                  <div className="space-y-2 pl-4">
                    {comments
                      .filter(comment => comment.resolved)
                      .map((comment) => (
                        <div key={comment.id} className="p-2 border rounded opacity-60 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{comment.author}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge variant="secondary" className="text-xs">Resolved</Badge>
                          </div>
                          <p>{comment.content}</p>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Cursor Overlays */}
      {isConnected && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from(cursors.entries()).map(([userId, { x, y, user }]) => (
            <div
              key={userId}
              className="absolute transition-all duration-100 pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: user.color }}
                />
                <Badge 
                  variant="secondary" 
                  className="text-xs px-1 py-0 shadow-lg"
                  style={{ backgroundColor: user.color, color: 'white' }}
                >
                  {user.name}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 