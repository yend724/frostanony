import { useState, useCallback } from 'react'

type UseImageUploadReturn = {
  image: File | null
  imageUrl: string | null
  isUploading: boolean
  error: string | null
  handleFileSelect: (file: File) => void
  clearImage: () => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const useImageUpload = (): UseImageUploadReturn => {
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!file) {
      return 'ファイルが選択されていません。'
    }
    
    if (file.size === 0) {
      return 'ファイルが空です。有効な画像ファイルを選択してください。'
    }
    
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `対応していないファイル形式です（${file.type}）。JPEG、PNG、WebPファイルを選択してください。`
    }
    
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 10) / 10
      return `ファイルサイズが大きすぎます（${sizeMB}MB）。10MB以下のファイルを選択してください。`
    }
    
    return null
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    setError(null)
    setIsUploading(true)

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setIsUploading(false)
      return
    }

    try {
      // 前の画像URLがあれば解放
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }

      // ブラウザサポートチェック
      if (!window.URL || !window.URL.createObjectURL) {
        throw new Error('このブラウザではファイル読み込み機能がサポートされていません。')
      }

      const url = URL.createObjectURL(file)
      setImage(file)
      setImageUrl(url)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました。'
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [imageUrl, validateFile])

  const clearImage = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    setImage(null)
    setImageUrl(null)
    setError(null)
  }, [imageUrl])

  return {
    image,
    imageUrl,
    isUploading,
    error,
    handleFileSelect,
    clearImage
  }
}