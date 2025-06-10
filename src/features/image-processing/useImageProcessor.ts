import { useState, useCallback, useRef } from 'react'
import { FaceDetectionResult } from '@/entities/face'
import { EffectType, EffectStrength, ImageEffectProcessor } from '@/features/image-effects'
import { imageToCanvas, createImageFromFile } from '@/shared/lib'

type UseImageProcessorReturn = {
  isProcessing: boolean
  error: string | null
  processedCanvas: HTMLCanvasElement | null
  originalCanvas: HTMLCanvasElement | null
  processImage: (
    file: File,
    detectionResult: FaceDetectionResult,
    effectType: EffectType,
    strength: EffectStrength
  ) => Promise<void>
  reprocessImage: (
    detectionResult: FaceDetectionResult,
    effectType: EffectType,
    strength: EffectStrength
  ) => Promise<void>
  clearError: () => void
  reset: () => void
}

export const useImageProcessor = (): UseImageProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null)
  const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null)
  
  const processorRef = useRef<ImageEffectProcessor>(new ImageEffectProcessor())

  const processImage = useCallback(async (
    file: File,
    detectionResult: FaceDetectionResult,
    effectType: EffectType,
    strength: EffectStrength
  ) => {
    try {
      setError(null)
      setIsProcessing(true)

      // 画像をCanvasに変換
      const image = await createImageFromFile(file)
      const canvas = imageToCanvas(image)
      setOriginalCanvas(canvas)

      // オリジナルのコピーを作成
      const processCanvas = document.createElement('canvas')
      processCanvas.width = canvas.width
      processCanvas.height = canvas.height
      const ctx = processCanvas.getContext('2d')
      if (!ctx) {
        throw new Error('Canvas context could not be created')
      }
      ctx.drawImage(canvas, 0, 0)

      // エフェクトを適用
      const result = await processorRef.current.applyEffect(
        processCanvas,
        detectionResult.faces,
        effectType,
        strength
      )

      setProcessedCanvas(result)
    } catch (err) {
      console.error('Image processing failed:', err)
      let errorMessage = '画像の処理に失敗しました'
      
      if (err instanceof Error) {
        if (err.message.includes('Canvas context')) {
          errorMessage = 'Canvas の初期化に失敗しました。ブラウザを再起動してください。'
        } else if (err.message.includes('memory')) {
          errorMessage = 'メモリ不足です。より小さな画像を使用してください。'
        } else if (err.message.includes('Invalid image')) {
          errorMessage = '画像データが無効です。別の画像を試してください。'
        } else {
          errorMessage = `処理エラー: ${err.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const reprocessImage = useCallback(async (
    detectionResult: FaceDetectionResult,
    effectType: EffectType,
    strength: EffectStrength
  ) => {
    if (!originalCanvas) {
      setError('処理する画像がありません')
      return
    }

    try {
      setError(null)
      setIsProcessing(true)

      // オリジナルのコピーを作成
      const processCanvas = document.createElement('canvas')
      processCanvas.width = originalCanvas.width
      processCanvas.height = originalCanvas.height
      const ctx = processCanvas.getContext('2d')
      if (!ctx) {
        throw new Error('Canvas context could not be created')
      }
      ctx.drawImage(originalCanvas, 0, 0)

      // エフェクトを適用
      const result = await processorRef.current.applyEffect(
        processCanvas,
        detectionResult.faces,
        effectType,
        strength
      )

      setProcessedCanvas(result)
    } catch (err) {
      console.error('Image processing failed:', err)
      let errorMessage = '画像の処理に失敗しました'
      
      if (err instanceof Error) {
        if (err.message.includes('Canvas context')) {
          errorMessage = 'Canvas の初期化に失敗しました。ブラウザを再起動してください。'
        } else if (err.message.includes('memory')) {
          errorMessage = 'メモリ不足です。より小さな画像を使用してください。'
        } else if (err.message.includes('Invalid image')) {
          errorMessage = '画像データが無効です。別の画像を試してください。'
        } else {
          errorMessage = `処理エラー: ${err.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [originalCanvas])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setProcessedCanvas(null)
    setOriginalCanvas(null)
    setError(null)
    setIsProcessing(false)
  }, [])

  return {
    isProcessing,
    error,
    processedCanvas,
    originalCanvas,
    processImage,
    reprocessImage,
    clearError,
    reset,
  }
}