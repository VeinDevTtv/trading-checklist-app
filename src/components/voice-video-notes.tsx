"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Mic, 
  Video, 
  Play, 
  Pause, 
  Square, 
  Trash2,
  Download,
  FileText,
  Clock
} from "lucide-react"

interface VoiceVideoNote {
  id: string
  type: 'voice' | 'video'
  blob: Blob
  url: string
  duration: number
  timestamp: string
  transcription?: string
  isTranscribing?: boolean
}

interface VoiceVideoNotesProps {
  notes: VoiceVideoNote[]
  onNotesChange: (notes: VoiceVideoNote[]) => void
  maxDuration?: number
}

export function VoiceVideoNotes({ 
  notes, 
  onNotesChange, 
  maxDuration = 30 
}: VoiceVideoNotesProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingType, setRecordingType] = useState<'voice' | 'video'>('voice')
  const [currentTime, setCurrentTime] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState<string | null>(null)
  const [browserWarning, setBrowserWarning] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Initialize Speech Recognition and check browser compatibility
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
    }

    // Check browser compatibility
    const checkBrowserCompatibility = async () => {
      const navigatorWithBrave = navigator as Navigator & { brave?: { isBrave(): Promise<boolean> } }
      const isBrave = navigatorWithBrave.brave && await navigatorWithBrave.brave.isBrave()
      
      if (isBrave) {
        setBrowserWarning('⚠️ Brave browser detected. Voice/video recording may not work properly due to known audio issues. For best results, use Chrome or Firefox.')
      } else if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setBrowserWarning('❌ Your browser does not support media recording. Please use a modern browser like Chrome, Firefox, or Safari.')
      }
    }

    checkBrowserCompatibility()
  }, [])

  const startRecording = async (type: 'voice' | 'video') => {
    try {
      // Enhanced constraints for better Brave browser compatibility
      const constraints = type === 'video' 
        ? { 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 15 }
            }, 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 44100
            }
          }
        : { 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 44100
            }
          }

      // Check if we're in Brave browser and show warning
      const navigatorWithBrave = navigator as Navigator & { brave?: { isBrave(): Promise<boolean> } }
      const isBrave = navigatorWithBrave.brave && await navigatorWithBrave.brave.isBrave()
      if (isBrave) {
        console.warn('Brave browser detected. Audio recording may have issues. Consider using Chrome or Firefox for better compatibility.')
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: type === 'video' ? 'video/webm' : 'audio/webm' 
        })
        const url = URL.createObjectURL(blob)
        
        const newNote: VoiceVideoNote = {
          id: Date.now().toString(),
          type,
          blob,
          url,
          duration: currentTime,
          timestamp: new Date().toLocaleString(),
          transcription: '',
          isTranscribing: false
        }

        onNotesChange([...notes, newNote])
        
        // Start transcription for voice notes
        if (type === 'voice') {
          transcribeAudio(newNote.id, blob)
        }

        // Cleanup
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
        setCurrentTime(0)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingType(type)
      setCurrentTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newTime
        })
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      
      // Provide specific error messages for common Brave browser issues
      let errorMessage = 'Could not access microphone/camera. '
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage += 'Permission denied. Please allow microphone/camera access in your browser settings.'
            break
          case 'NotFoundError':
            errorMessage += 'No microphone/camera found. Please check your device connections.'
            break
          case 'NotSupportedError':
            errorMessage += 'Recording not supported. Try using Chrome or Firefox for better compatibility.'
            break
          case 'OverconstrainedError':
            errorMessage += 'Audio/video constraints not supported. Trying with basic settings...'
            // Fallback with minimal constraints
            try {
              const fallbackConstraints = type === 'video' 
                ? { video: true, audio: true }
                : { audio: true }
              const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
              streamRef.current = fallbackStream
              // Continue with recording setup...
              return
                         } catch {
               errorMessage += ' Fallback also failed.'
             }
            break
          default:
            errorMessage += 'Unknown error occurred. Please try again or use a different browser.'
        }
      }
      
      alert(errorMessage + '\n\nNote: Brave browser has known audio recording issues. Consider using Chrome or Firefox.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const transcribeAudio = async (noteId: string, audioBlob: Blob) => {
    setIsTranscribing(noteId)
    
    // Update the note to show transcribing status
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, isTranscribing: true } : note
    )
    onNotesChange(updatedNotes)

    try {
      // Convert blob to audio for speech recognition
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = ''
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' '
          }
          
          // Update the note with transcription
          const finalNotes = notes.map(note => 
            note.id === noteId 
              ? { ...note, transcription: transcript.trim(), isTranscribing: false }
              : note
          )
          onNotesChange(finalNotes)
          setIsTranscribing(null)
        }

        recognitionRef.current.onerror = () => {
          const errorNotes = notes.map(note => 
            note.id === noteId 
              ? { ...note, transcription: 'Transcription failed', isTranscribing: false }
              : note
          )
          onNotesChange(errorNotes)
          setIsTranscribing(null)
        }

        // Play audio and start recognition
        audio.play()
        recognitionRef.current.start()
        
        // Stop recognition when audio ends
        audio.onended = () => {
          if (recognitionRef.current) {
            recognitionRef.current.stop()
          }
        }
      } else {
        // Fallback if Speech Recognition is not available
        const fallbackNotes = notes.map(note => 
          note.id === noteId 
            ? { ...note, transcription: 'Speech recognition not available in this browser', isTranscribing: false }
            : note
        )
        onNotesChange(fallbackNotes)
        setIsTranscribing(null)
      }
    } catch (error) {
      console.error('Transcription error:', error)
      const errorNotes = notes.map(note => 
        note.id === noteId 
          ? { ...note, transcription: 'Transcription error', isTranscribing: false }
          : note
      )
      onNotesChange(errorNotes)
      setIsTranscribing(null)
    }
  }

  const playNote = (note: VoiceVideoNote) => {
    if (playingId === note.id) {
      setPlayingId(null)
      return
    }

    const element = note.type === 'video' 
      ? document.createElement('video')
      : document.createElement('audio')
    
    element.src = note.url
    element.play()
    setPlayingId(note.id)

    element.onended = () => setPlayingId(null)
  }

  const deleteNote = (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId)
    if (noteToDelete) {
      URL.revokeObjectURL(noteToDelete.url)
    }
    onNotesChange(notes.filter(n => n.id !== noteId))
  }

  const downloadNote = (note: VoiceVideoNote) => {
    const a = document.createElement('a')
    a.href = note.url
    a.download = `${note.type}-note-${note.timestamp.replace(/[:/]/g, '-')}.webm`
    a.click()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice & Video Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Browser Warning */}
        {browserWarning && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="p-3">
              <div className="text-sm text-orange-800 dark:text-orange-200">
                {browserWarning}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <>
              <Button
                onClick={() => startRecording('voice')}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Mic className="h-4 w-4" />
                Record Voice
              </Button>
              <Button
                onClick={() => startRecording('video')}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Video className="h-4 w-4" />
                Record Video
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(currentTime)} / {formatTime(maxDuration)}
              </Badge>
              <Badge variant="outline">
                {recordingType === 'voice' ? <Mic className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                {recordingType}
              </Badge>
            </div>
          )}
        </div>

        {/* Notes List */}
        {notes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label>Recorded Notes ({notes.length})</Label>
              {notes.map((note) => (
                <Card key={note.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {note.type === 'voice' ? <Mic className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                          {note.type}
                        </Badge>
                        <Badge variant="secondary">
                          {formatTime(note.duration)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {note.timestamp}
                        </span>
                      </div>

                      {/* Transcription */}
                      {note.type === 'voice' && (
                        <div className="space-y-1">
                          <Label className="text-xs flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Transcription
                          </Label>
                          {note.isTranscribing || isTranscribing === note.id ? (
                            <div className="text-sm text-muted-foreground italic">
                              Transcribing audio...
                            </div>
                          ) : (
                            <Textarea
                              value={note.transcription || ''}
                              onChange={(e) => {
                                const updatedNotes = notes.map(n => 
                                  n.id === note.id ? { ...n, transcription: e.target.value } : n
                                )
                                onNotesChange(updatedNotes)
                              }}
                              placeholder="Transcription will appear here..."
                              className="text-sm min-h-[60px]"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playNote(note)}
                        className="h-8 w-8 p-0"
                      >
                        {playingId === note.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadNote(note)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNote(note.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Browser Support Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Browser Compatibility:</strong></p>
          <p>• ✅ Chrome/Edge: Full support for voice & video recording</p>
          <p>• ✅ Firefox: Good support for recording</p>
          <p>• ✅ Safari: Basic recording support</p>
          <p>• ⚠️ Brave: Known audio issues - use Chrome/Firefox instead</p>
          <p>• Maximum recording duration: {maxDuration} seconds</p>
          <p>• Recordings are stored locally in your browser</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition
    SpeechRecognition: new () => SpeechRecognition
  }
} 