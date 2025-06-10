import { renderHook, act } from '@testing-library/react'
import { useImageProcessor } from './useImageProcessor'
import { FaceDetectionResult } from '@/entities/face'
import { EffectType, EffectStrength } from '@/features/image-effects'

// Canvas APIのモック
const mockGetContext = vi.fn()
const mockDrawImage = vi.fn()
const mockGetImageData = vi.fn()
const mockPutImageData = vi.fn()
const mockToDataURL = vi.fn()

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext,
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: mockToDataURL,
})

// ImageEffectProcessorのモック
vi.mock('@/features/image-effects', async () => {
  const actual = await vi.importActual('@/features/image-effects')
  return {
    ...actual,
    ImageEffectProcessor: vi.fn().mockImplementation(() => ({
      applyEffect: vi.fn().mockResolvedValue(document.createElement('canvas')),
    })),
  }
})

// createImageFromFileのモック
vi.mock('@/shared/lib', () => ({
  createImageFromFile: vi.fn().mockResolvedValue({
    width: 800,
    height: 600,
  }),
  imageToCanvas: vi.fn().mockReturnValue(document.createElement('canvas')),
}))

describe('useImageProcessor', () => {
  const mockContext = {
    drawImage: mockDrawImage,
    getImageData: mockGetImageData,
    putImageData: mockPutImageData,
    canvas: { width: 800, height: 600 },
  }

  const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
  const mockDetectionResult: FaceDetectionResult = {
    count: 2,
    faces: [
      { x: 100, y: 100, width: 50, height: 50 },
      { x: 200, y: 150, width: 60, height: 60 },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetContext.mockReturnValue(mockContext)
    mockToDataURL.mockReturnValue('data:image/png;base64,mock')
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useImageProcessor())

    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.processedCanvas).toBe(null)
    expect(result.current.originalCanvas).toBe(null)
  })

  it('should process image successfully', async () => {
    const { result } = renderHook(() => useImageProcessor())

    await act(async () => {
      await result.current.processImage(
        mockFile,
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.MEDIUM
      )
    })

    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.processedCanvas).not.toBe(null)
    expect(result.current.originalCanvas).not.toBe(null)
  })

  it('should handle processing error', async () => {
    // ImageEffectProcessorのapplyEffectメソッドがエラーを投げるようにモック
    const { ImageEffectProcessor } = await import('@/features/image-effects')
    const mockProcessor = new (ImageEffectProcessor as any)()
    mockProcessor.applyEffect.mockRejectedValue(new Error('Processing failed'))

    const { result } = renderHook(() => useImageProcessor())

    await act(async () => {
      await result.current.processImage(
        mockFile,
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.MEDIUM
      )
    })

    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe('画像の処理に失敗しました')
    expect(result.current.processedCanvas).toBe(null)
  })

  it('should reprocess image successfully', async () => {
    const { result } = renderHook(() => useImageProcessor())

    // 最初に画像を処理
    await act(async () => {
      await result.current.processImage(
        mockFile,
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.MEDIUM
      )
    })

    // 再処理を実行
    await act(async () => {
      await result.current.reprocessImage(
        mockDetectionResult,
        EffectType.MOSAIC,
        EffectStrength.STRONG
      )
    })

    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.processedCanvas).not.toBe(null)
  })

  it('should handle reprocess error when no original canvas', async () => {
    const { result } = renderHook(() => useImageProcessor())

    await act(async () => {
      await result.current.reprocessImage(
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.MEDIUM
      )
    })

    expect(result.current.error).toBe('処理する画像がありません')
  })

  it('should handle canvas context creation failure', async () => {
    mockGetContext.mockReturnValue(null)

    const { result } = renderHook(() => useImageProcessor())

    await act(async () => {
      await result.current.processImage(
        mockFile,
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.MEDIUM
      )
    })

    expect(result.current.error).toBe('画像の処理に失敗しました')
  })

  it('should clear error', async () => {
    const { result } = renderHook(() => useImageProcessor())

    // エラーを設定
    mockGetContext.mockReturnValue(null)
    await act(async () => {
      await result.current.processImage(
        mockFile,
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.MEDIUM
      )
    })

    expect(result.current.error).toBe('画像の処理に失敗しました')

    // エラーをクリア
    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBe(null)
  })

  it('should reset state', async () => {
    const { result } = renderHook(() => useImageProcessor())

    // 画像を処理してステートを設定
    mockGetContext.mockReturnValue(mockContext)
    await act(async () => {
      await result.current.processImage(
        mockFile,
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.MEDIUM
      )
    })

    expect(result.current.processedCanvas).not.toBe(null)
    expect(result.current.originalCanvas).not.toBe(null)

    // リセット
    act(() => {
      result.current.reset()
    })

    expect(result.current.processedCanvas).toBe(null)
    expect(result.current.originalCanvas).toBe(null)
    expect(result.current.error).toBe(null)
    expect(result.current.isProcessing).toBe(false)
  })

  it('should set processing state during image processing', async () => {
    const { result } = renderHook(() => useImageProcessor())

    let processingState = false
    const promise = act(async () => {
      const processingPromise = result.current.processImage(
        mockFile,
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.MEDIUM
      )
      
      // 処理中の状態をチェック
      processingState = result.current.isProcessing
      
      await processingPromise
    })

    expect(processingState).toBe(true)
    await promise
    expect(result.current.isProcessing).toBe(false)
  })

  it('should handle different effect types and strengths', async () => {
    const { result } = renderHook(() => useImageProcessor())

    // ぼかしエフェクトのテスト
    await act(async () => {
      await result.current.processImage(
        mockFile,
        mockDetectionResult,
        EffectType.BLUR,
        EffectStrength.WEAK
      )
    })

    expect(result.current.error).toBe(null)

    // モザイクエフェクトのテスト
    await act(async () => {
      await result.current.reprocessImage(
        mockDetectionResult,
        EffectType.MOSAIC,
        EffectStrength.VERY_STRONG
      )
    })

    expect(result.current.error).toBe(null)
  })
})