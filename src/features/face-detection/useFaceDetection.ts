import { useState, useEffect, useCallback, useRef } from 'react'
import { FaceDetector, FaceDetectionResult } from '@/entities/face'

type UseFaceDetectionReturn = {
  isInitialized: boolean
  isDetecting: boolean
  error: string | null
  lastDetectionResult: FaceDetectionResult | null
  initialize: () => Promise<void>
  detectFaces: (image: ImageData | HTMLImageElement | HTMLCanvasElement) => Promise<FaceDetectionResult | null>
  clearError: () => void
}

export const useFaceDetection = (): UseFaceDetectionReturn => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastDetectionResult, setLastDetectionResult] = useState<FaceDetectionResult | null>(null)
  
  const detectorRef = useRef<FaceDetector | null>(null)

  useEffect(() => {
    detectorRef.current = new FaceDetector()

    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose()
      }
    }
  }, [])

  const initialize = useCallback(async () => {
    if (!detectorRef.current) return

    try {
      setError(null)
      console.log('Starting face detection initialization...')
      await detectorRef.current.initialize()
      setIsInitialized(detectorRef.current.isInitialized())
      console.log('Face detection initialization completed')
    } catch (err) {
      console.error('Face detection initialization failed:', err)
      let errorMessage = '顔検出の初期化に失敗しました'
      
      if (err instanceof Error) {
        if (err.message.includes('WebGL')) {
          errorMessage = 'WebGL が利用できません。ブラウザの設定を確認してください。'
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'ネットワークエラーです。インターネット接続を確認してください。'
        } else if (err.message.includes('memory')) {
          errorMessage = 'メモリ不足です。ブラウザのタブを閉じて再試行してください。'
        } else {
          errorMessage = `初期化エラー: ${err.message}`
        }
      }
      
      setError(errorMessage)
    }
  }, [])

  const detectFaces = useCallback(async (image: ImageData | HTMLImageElement | HTMLCanvasElement) => {
    if (!detectorRef.current) {
      setError('顔検出器が初期化されていません')
      return null
    }

    if (!detectorRef.current.isInitialized()) {
      setError('顔検出器が初期化されていません')
      return null
    }

    try {
      setError(null)
      setIsDetecting(true)
      
      const result = await detectorRef.current.detectFaces(image)
      setLastDetectionResult(result)
      return result
    } catch (err) {
      console.error('Face detection failed:', err)
      let errorMessage = '顔の検出に失敗しました'
      
      if (err instanceof Error) {
        if (err.message.includes('Invalid image')) {
          errorMessage = '画像が無効です。別の画像ファイルを試してください。'
        } else if (err.message.includes('memory')) {
          errorMessage = 'メモリ不足です。より小さな画像を使用してください。'
        } else if (err.message.includes('WebGL')) {
          errorMessage = 'WebGLエラーです。ページを再読み込みしてください。'
        } else {
          errorMessage = `検出エラー: ${err.message}`
        }
      }
      
      setError(errorMessage)
      return null
    } finally {
      setIsDetecting(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isInitialized,
    isDetecting,
    error,
    lastDetectionResult,
    initialize,
    detectFaces,
    clearError,
  }
}