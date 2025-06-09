import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFaceDetection } from './useFaceDetection'
import { FaceDetector } from '@/entities/face'

// FaceDetectorのモック
vi.mock('@/entities/face', () => {
  return {
    FaceDetector: vi.fn(() => ({
      initialize: vi.fn(),
      detectFaces: vi.fn(),
      isInitialized: vi.fn(),
      dispose: vi.fn(),
    })),
  }
})

describe('useFaceDetection', () => {
  let mockFaceDetector: any

  beforeEach(() => {
    mockFaceDetector = {
      initialize: vi.fn().mockResolvedValue(undefined),
      detectFaces: vi.fn(),
      isInitialized: vi.fn().mockReturnValue(false),
      dispose: vi.fn(),
    }

    vi.mocked(FaceDetector).mockImplementation(() => mockFaceDetector)
  })

  describe('初期化', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useFaceDetection())

      expect(result.current.isInitialized).toBe(false)
      expect(result.current.isDetecting).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.lastDetectionResult).toBe(null)
    })

    it('initializeを呼び出すとFaceDetectorが初期化される', async () => {
      const { result } = renderHook(() => useFaceDetection())

      await act(async () => {
        await result.current.initialize()
      })

      expect(mockFaceDetector.initialize).toHaveBeenCalled()
    })

    it('初期化に失敗した場合はエラーが設定される', async () => {
      mockFaceDetector.initialize.mockRejectedValue(new Error('初期化失敗'))

      const { result } = renderHook(() => useFaceDetection())

      await act(async () => {
        await result.current.initialize()
      })

      expect(result.current.error).toBe('顔検出の初期化に失敗しました')
    })
  })

  describe('顔検出', () => {
    beforeEach(async () => {
      mockFaceDetector.isInitialized.mockReturnValue(true)
    })

    it('画像から顔を検出する', async () => {
      const mockResult = {
        faces: [{ x: 100, y: 150, width: 200, height: 250 }],
        count: 1,
      }
      mockFaceDetector.detectFaces.mockResolvedValue(mockResult)

      const { result } = renderHook(() => useFaceDetection())
      const mockImage = new ImageData(800, 600)

      await act(async () => {
        await result.current.detectFaces(mockImage)
      })

      expect(mockFaceDetector.detectFaces).toHaveBeenCalledWith(mockImage)
      expect(result.current.lastDetectionResult).toEqual(mockResult)
    })

    it('検出中はisDetectingがtrueになる', async () => {
      let resolveDetection: (value: any) => void
      const detectionPromise = new Promise((resolve) => {
        resolveDetection = resolve
      })
      mockFaceDetector.detectFaces.mockReturnValue(detectionPromise)

      const { result } = renderHook(() => useFaceDetection())
      const mockImage = new ImageData(800, 600)

      act(() => {
        result.current.detectFaces(mockImage)
      })

      expect(result.current.isDetecting).toBe(true)

      await act(async () => {
        resolveDetection({ faces: [], count: 0 })
        await detectionPromise
      })

      expect(result.current.isDetecting).toBe(false)
    })

    it('初期化されていない場合はエラーが設定される', async () => {
      mockFaceDetector.isInitialized.mockReturnValue(false)

      const { result } = renderHook(() => useFaceDetection())
      const mockImage = new ImageData(800, 600)

      await act(async () => {
        await result.current.detectFaces(mockImage)
      })

      expect(result.current.error).toBe('顔検出器が初期化されていません')
    })

    it('検出処理でエラーが発生した場合はエラーが設定される', async () => {
      mockFaceDetector.detectFaces.mockRejectedValue(new Error('検出失敗'))

      const { result } = renderHook(() => useFaceDetection())
      const mockImage = new ImageData(800, 600)

      await act(async () => {
        await result.current.detectFaces(mockImage)
      })

      expect(result.current.error).toBe('顔の検出に失敗しました')
    })
  })

  describe('エラーハンドリング', () => {
    it('clearErrorでエラーがクリアされる', async () => {
      mockFaceDetector.initialize.mockRejectedValue(new Error('初期化失敗'))

      const { result } = renderHook(() => useFaceDetection())

      await act(async () => {
        await result.current.initialize()
      })

      expect(result.current.error).toBe('顔検出の初期化に失敗しました')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('クリーンアップ', () => {
    it('コンポーネントがアンマウントされるとdisposeが呼ばれる', () => {
      const { unmount } = renderHook(() => useFaceDetection())

      unmount()

      expect(mockFaceDetector.dispose).toHaveBeenCalled()
    })
  })
})