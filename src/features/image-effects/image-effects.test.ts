import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BlurEffect, MosaicEffect, EffectType, EffectStrength } from './image-effects'
import { FaceBox } from '@/entities/face'

// Canvas APIのモック
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: vi.fn(),
} as unknown as HTMLCanvasElement

const mockContext = {
  canvas: mockCanvas,
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  filter: '',
  save: vi.fn(),
  restore: vi.fn(),
  globalCompositeOperation: 'source-over',
  drawImage: vi.fn(),
  beginPath: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
} as unknown as CanvasRenderingContext2D

describe('BlurEffect', () => {
  let blurEffect: BlurEffect
  let mockImageData: ImageData

  beforeEach(() => {
    blurEffect = new BlurEffect()
    mockImageData = new ImageData(800, 600)
    
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockContext)
    vi.mocked(mockContext.getImageData).mockReturnValue(mockImageData)
  })

  describe('getBlurRadius', () => {
    it('強度に応じて適切なぼかし半径を返す', () => {
      expect(blurEffect.getBlurRadius(EffectStrength.WEAK)).toBe(2)
      expect(blurEffect.getBlurRadius(EffectStrength.LIGHT)).toBe(4)
      expect(blurEffect.getBlurRadius(EffectStrength.MEDIUM)).toBe(6)
      expect(blurEffect.getBlurRadius(EffectStrength.STRONG)).toBe(8)
      expect(blurEffect.getBlurRadius(EffectStrength.VERY_STRONG)).toBe(10)
    })
  })

  describe('apply', () => {
    const mockFaces: FaceBox[] = [
      { x: 100, y: 150, width: 200, height: 250 },
      { x: 400, y: 200, width: 180, height: 220 },
    ]

    it('指定された顔領域にぼかしエフェクトを適用する', async () => {
      const result = await blurEffect.apply(mockCanvas, mockFaces, EffectStrength.MEDIUM)

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
      expect(mockContext.save).toHaveBeenCalledTimes(mockFaces.length)
      expect(mockContext.restore).toHaveBeenCalledTimes(mockFaces.length)
      expect(result).toBe(mockCanvas)
    })

    it('顔が検出されない場合は元のキャンバスをそのまま返す', async () => {
      vi.clearAllMocks()
      const result = await blurEffect.apply(mockCanvas, [], EffectStrength.MEDIUM)

      expect(result).toBe(mockCanvas)
      expect(mockContext.save).not.toHaveBeenCalled()
    })

    it('コンテキストが取得できない場合はエラーを投げる', async () => {
      vi.mocked(mockCanvas.getContext).mockReturnValue(null)

      await expect(
        blurEffect.apply(mockCanvas, mockFaces, EffectStrength.MEDIUM)
      ).rejects.toThrow('Canvas context could not be created')
    })
  })
})

describe('MosaicEffect', () => {
  let mosaicEffect: MosaicEffect
  let mockImageData: ImageData

  beforeEach(() => {
    mosaicEffect = new MosaicEffect()
    mockImageData = new ImageData(800, 600)
    
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockContext)
    vi.mocked(mockContext.getImageData).mockReturnValue(mockImageData)
  })

  describe('getPixelSize', () => {
    it('強度に応じて適切なピクセルサイズを返す', () => {
      expect(mosaicEffect.getPixelSize(EffectStrength.WEAK)).toBe(4)
      expect(mosaicEffect.getPixelSize(EffectStrength.LIGHT)).toBe(8)
      expect(mosaicEffect.getPixelSize(EffectStrength.MEDIUM)).toBe(12)
      expect(mosaicEffect.getPixelSize(EffectStrength.STRONG)).toBe(16)
      expect(mosaicEffect.getPixelSize(EffectStrength.VERY_STRONG)).toBe(20)
    })
  })

  describe('apply', () => {
    const mockFaces: FaceBox[] = [
      { x: 100, y: 150, width: 200, height: 250 },
    ]

    it('指定された顔領域にモザイクエフェクトを適用する', async () => {
      const result = await mosaicEffect.apply(mockCanvas, mockFaces, EffectStrength.MEDIUM)

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
      expect(mockContext.getImageData).toHaveBeenCalled()
      expect(mockContext.putImageData).toHaveBeenCalled()
      expect(result).toBe(mockCanvas)
    })

    it('顔が検出されない場合は元のキャンバスをそのまま返す', async () => {
      vi.clearAllMocks()
      const result = await mosaicEffect.apply(mockCanvas, [], EffectStrength.MEDIUM)

      expect(result).toBe(mockCanvas)
      expect(mockContext.getImageData).not.toHaveBeenCalled()
    })

    it('コンテキストが取得できない場合はエラーを投げる', async () => {
      vi.mocked(mockCanvas.getContext).mockReturnValue(null)

      await expect(
        mosaicEffect.apply(mockCanvas, mockFaces, EffectStrength.MEDIUM)
      ).rejects.toThrow('Canvas context could not be created')
    })
  })
})

describe('エフェクト定数', () => {
  it('EffectTypeが正しく定義されている', () => {
    expect(EffectType.BLUR).toBe('blur')
    expect(EffectType.MOSAIC).toBe('mosaic')
  })

  it('EffectStrengthが正しく定義されている', () => {
    expect(EffectStrength.WEAK).toBe(1)
    expect(EffectStrength.LIGHT).toBe(2)
    expect(EffectStrength.MEDIUM).toBe(3)
    expect(EffectStrength.STRONG).toBe(4)
    expect(EffectStrength.VERY_STRONG).toBe(5)
  })
})