import { useState, useEffect, useCallback, useRef } from 'react'
import { FaceDetector, FaceDetectionResult } from '@/entities/face'

type UseFaceDetectionReturn = {
  isInitialized: boolean
  isDetecting: boolean
  error: string | null
  lastDetectionResult: FaceDetectionResult | null
  initialize: () => Promise<void>
  detectFaces: (image: ImageData | HTMLImageElement | HTMLCanvasElement) => Promise<void>
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
      await detectorRef.current.initialize()
      setIsInitialized(detectorRef.current.isInitialized())
    } catch (err) {
      setError('顔検出の初期化に失敗しました')
    }
  }, [])

  const detectFaces = useCallback(async (image: ImageData | HTMLImageElement | HTMLCanvasElement) => {
    if (!detectorRef.current) {
      setError('顔検出器が初期化されていません')
      return
    }

    if (!detectorRef.current.isInitialized()) {
      setError('顔検出器が初期化されていません')
      return
    }

    try {
      setError(null)
      setIsDetecting(true)
      
      const result = await detectorRef.current.detectFaces(image)
      setLastDetectionResult(result)
    } catch (err) {
      setError('顔の検出に失敗しました')
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