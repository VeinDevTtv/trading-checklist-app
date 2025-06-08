"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  ZoomIn, 
  Download,
  Clipboard,
  AlertCircle
} from "lucide-react"
import { ImageStorageManager, TradeImage } from "@/lib/image-storage"

interface ImageAttachmentProps {
  tradeId?: number
  images: TradeImage[]
  onImagesChange: (images: TradeImage[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageAttachment({ 
  tradeId, 
  images, 
  onImagesChange, 
  maxImages = 5,
  disabled = false 
}: ImageAttachmentProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedImage, setSelectedImage] = useState<TradeImage | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: File[]) => {
    if (disabled || uploading) return
    
    setError(null)
    setUploading(true)

    try {
      const validFiles = files.filter(file => {
        const validation = ImageStorageManager.validateImage(file)
        if (!validation.valid) {
          setError(validation.error || 'Invalid file')
          return false
        }
        return true
      })

      if (validFiles.length === 0) {
        setUploading(false)
        return
      }

      if (images.length + validFiles.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`)
        setUploading(false)
        return
      }

      const newImages: TradeImage[] = []
      
      for (const file of validFiles) {
        if (tradeId) {
          // Save to IndexedDB if we have a trade ID
          const imageId = await ImageStorageManager.saveImage(tradeId, file, file.name)
          const savedImage = await ImageStorageManager.getImage(imageId)
          if (savedImage) {
            newImages.push(savedImage)
          }
        } else {
          // Create temporary image object for preview
          const thumbnail = await ImageStorageManager.createThumbnail(file)
          const tempImage: TradeImage = {
            tradeId: 0,
            imageId: `temp_${Date.now()}_${Math.random()}`,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            blob: file,
            thumbnail,
            uploadedAt: Date.now()
          }
          newImages.push(tempImage)
        }
      }

      onImagesChange([...images, ...newImages])
    } catch (error) {
      console.error('Failed to process images:', error)
      setError('Failed to process images')
    } finally {
      setUploading(false)
    }
  }, [disabled, uploading, images, maxImages, tradeId, onImagesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = ImageStorageManager.handleDrop(e.nativeEvent)
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = ImageStorageManager.handlePaste(e.nativeEvent)
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const removeImage = useCallback(async (imageToRemove: TradeImage) => {
    try {
      if (tradeId && !imageToRemove.imageId.startsWith('temp_')) {
        await ImageStorageManager.deleteImage(imageToRemove.imageId)
      }
      onImagesChange(images.filter(img => img.imageId !== imageToRemove.imageId))
    } catch (error) {
      console.error('Failed to remove image:', error)
      setError('Failed to remove image')
    }
  }, [images, onImagesChange, tradeId])

  const downloadImage = useCallback((image: TradeImage) => {
    const url = ImageStorageManager.createObjectURL(image.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ImageStorageManager.revokeObjectURL(url)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : disabled 
            ? 'border-muted bg-muted/20' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div>
              <p className="text-sm font-medium">
                {dragActive ? 'Drop images here' : 'Add screenshots or charts'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop, paste from clipboard, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG, GIF, WebP • Max 10MB per image • {maxImages} images max
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading || images.length >= maxImages}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Focus the component to enable paste
                  document.addEventListener('paste', (e) => {
                    const files = ImageStorageManager.handlePaste(e)
                    if (files.length > 0) {
                      handleFiles(files)
                    }
                  }, { once: true })
                }}
                disabled={disabled || uploading || images.length >= maxImages}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Paste
              </Button>
            </div>

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Processing images...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.imageId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={ImageStorageManager.createObjectURL(image.thumbnail || image.blob)}
                    alt={image.filename}
                    className="w-full h-32 object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedImage(image)}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadImage(image)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(image)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Image Info */}
                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium truncate" title={image.filename}>
                    {image.filename}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(image.size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {image.mimeType.split('/')[1].toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedImage?.filename}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedImage && downloadImage(selectedImage)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (selectedImage) {
                      removeImage(selectedImage)
                      setSelectedImage(null)
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={ImageStorageManager.createObjectURL(selectedImage.blob)}
                alt={selectedImage.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          
          {selectedImage && (
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
              <span>Size: {formatFileSize(selectedImage.size)}</span>
              <span>Type: {selectedImage.mimeType}</span>
              <span>Uploaded: {new Date(selectedImage.uploadedAt).toLocaleString()}</span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
} 