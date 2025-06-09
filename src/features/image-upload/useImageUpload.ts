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
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return '対応していないファイル形式です。JPEG、PNG、WebPファイルを選択してください。'
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。'
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

      const url = URL.createObjectURL(file)
      setImage(file)
      setImageUrl(url)
    } catch (err) {
      setError('ファイルの読み込みに失敗しました。')
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