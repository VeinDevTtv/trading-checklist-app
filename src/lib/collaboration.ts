import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

export interface CollaborationComment {
  id: string
  author: string
  content: string
  timestamp: string
  conditionId?: number
  position?: { x: number; y: number }
  resolved?: boolean
}

export interface CollaborationUser {
  id: string
  name: string
  color: string
  cursor?: { x: number; y: number }
  isOnline: boolean
}

export class CollaborationProvider {
  private doc: Y.Doc
  private provider: WebrtcProvider | null = null
  private roomId: string
  private userId: string
  private userName: string
  private userColor: string
  
  // Shared data structures
  public checkedItems: Y.Array<number>
  public notes: Y.Text
  public comments: Y.Array<CollaborationComment>
  public users: Y.Map<CollaborationUser>
  public cursors: Y.Map<{ x: number; y: number; timestamp: number }>

  constructor(roomId: string, userId: string, userName: string) {
    this.roomId = roomId
    this.userId = userId
    this.userName = userName
    this.userColor = this.generateUserColor(userId)
    
    this.doc = new Y.Doc()
    
    // Initialize shared data structures
    this.checkedItems = this.doc.getArray('checkedItems')
    this.notes = this.doc.getText('notes')
    this.comments = this.doc.getArray('comments')
    this.users = this.doc.getMap('users')
    this.cursors = this.doc.getMap('cursors')
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create WebRTC provider
        this.provider = new WebrtcProvider(this.roomId, this.doc, {
          signaling: ['wss://signaling.yjs.dev'],
          password: null,
          awareness: {
            user: {
              id: this.userId,
              name: this.userName,
              color: this.userColor
            }
          }
        })

        // Add current user to users map
        this.users.set(this.userId, {
          id: this.userId,
          name: this.userName,
          color: this.userColor,
          isOnline: true
        })

        // Listen for connection events
        this.provider.on('status', (event: { status: string }) => {
          if (event.status === 'connected') {
            resolve()
          }
        })

        // Handle awareness updates (user presence)
        this.provider.awareness.on('change', () => {
          this.updateUserPresence()
        })

        // Set up periodic cleanup
        setInterval(() => {
          this.cleanupOfflineUsers()
        }, 30000) // Clean up every 30 seconds

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.provider) {
      // Mark user as offline
      const user = this.users.get(this.userId)
      if (user) {
        this.users.set(this.userId, { ...user, isOnline: false })
      }
      
      this.provider.destroy()
      this.provider = null
    }
  }

  // Checklist synchronization
  updateCheckedItems(checkedIds: number[]): void {
    this.doc.transact(() => {
      this.checkedItems.delete(0, this.checkedItems.length)
      checkedIds.forEach(id => this.checkedItems.push([id]))
    })
  }

  onCheckedItemsChange(callback: (checkedIds: number[]) => void): void {
    this.checkedItems.observe(() => {
      const checkedIds = this.checkedItems.toArray()
      callback(checkedIds)
    })
  }

  // Notes synchronization
  updateNotes(content: string): void {
    this.doc.transact(() => {
      this.notes.delete(0, this.notes.length)
      this.notes.insert(0, content)
    })
  }

  onNotesChange(callback: (content: string) => void): void {
    this.notes.observe(() => {
      callback(this.notes.toString())
    })
  }

  // Comments system
  addComment(content: string, conditionId?: number, position?: { x: number; y: number }): string {
    const comment: CollaborationComment = {
      id: Date.now().toString() + '-' + this.userId,
      author: this.userName,
      content,
      timestamp: new Date().toISOString(),
      conditionId,
      position,
      resolved: false
    }

    this.comments.push([comment])
    return comment.id
  }

  resolveComment(commentId: string): void {
    const comments = this.comments.toArray()
    const index = comments.findIndex(c => c.id === commentId)
    if (index !== -1) {
      const comment = comments[index]
      this.comments.delete(index, 1)
      this.comments.insert(index, [{ ...comment, resolved: true }])
    }
  }

  deleteComment(commentId: string): void {
    const comments = this.comments.toArray()
    const index = comments.findIndex(c => c.id === commentId)
    if (index !== -1) {
      this.comments.delete(index, 1)
    }
  }

  onCommentsChange(callback: (comments: CollaborationComment[]) => void): void {
    this.comments.observe(() => {
      callback(this.comments.toArray())
    })
  }

  // Cursor tracking
  updateCursor(x: number, y: number): void {
    this.cursors.set(this.userId, {
      x,
      y,
      timestamp: Date.now()
    })
  }

  onCursorsChange(callback: (cursors: Map<string, { x: number; y: number; user: CollaborationUser }>) => void): void {
    this.cursors.observe(() => {
      const cursorsWithUsers = new Map()
      this.cursors.forEach((cursor, userId) => {
        const user = this.users.get(userId)
        if (user && user.isOnline) {
          cursorsWithUsers.set(userId, { ...cursor, user })
        }
      })
      callback(cursorsWithUsers)
    })
  }

  // User presence
  private updateUserPresence(): void {
    if (!this.provider) return

    const awarenessStates = this.provider.awareness.getStates()
    
    awarenessStates.forEach((state, clientId) => {
      if (state.user && clientId !== this.provider!.awareness.clientID) {
        this.users.set(state.user.id, {
          ...state.user,
          isOnline: true
        })
      }
    })
  }

  private cleanupOfflineUsers(): void {
    const now = Date.now()
    const timeout = 60000 // 1 minute timeout

    this.cursors.forEach((cursor, userId) => {
      if (now - cursor.timestamp > timeout) {
        const user = this.users.get(userId)
        if (user) {
          this.users.set(userId, { ...user, isOnline: false })
        }
        this.cursors.delete(userId)
      }
    })
  }

  private generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]
    
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  // Get current users
  getUsers(): CollaborationUser[] {
    return Array.from(this.users.values()).filter(user => user.isOnline)
  }

  // Room management
  static generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  static generateUserId(): string {
    return 'user-' + Math.random().toString(36).substring(2, 15)
  }
} 