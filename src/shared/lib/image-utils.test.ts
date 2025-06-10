import { describe, it, expect } from 'vitest'

// 純粋関数のテスト用ヘルパー
function validateImageDimensions(width: number, height: number): { isValid: boolean; error?: string } {
  if (width <= 0 || height <= 0) {
    return { isValid: false, error: 'Invalid dimensions' }
  }
  if (width > 10000 || height > 10000) {
    return { isValid: false, error: 'Dimensions too large' }
  }
  return { isValid: true }
}

function calculateCanvasSize(naturalWidth: number, naturalHeight: number, maxSize = 2048): { width: number; height: number } {
  if (naturalWidth <= maxSize && naturalHeight <= maxSize) {
    return { width: naturalWidth, height: naturalHeight }
  }
  
  const ratio = Math.min(maxSize / naturalWidth, maxSize / naturalHeight)
  return {
    width: Math.floor(naturalWidth * ratio),
    height: Math.floor(naturalHeight * ratio)
  }
}

describe('image-utils core logic', () => {
  describe('validateImageDimensions', () => {
    it('有効な寸法の場合はtrueを返す', () => {
      const result = validateImageDimensions(800, 600)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('幅が0以下の場合は無効', () => {
      const result = validateImageDimensions(0, 600)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid dimensions')
    })

    it('高さが0以下の場合は無効', () => {
      const result = validateImageDimensions(800, -1)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid dimensions')
    })

    it('寸法が大きすぎる場合は無効', () => {
      const result = validateImageDimensions(20000, 600)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Dimensions too large')
    })
  })

  describe('calculateCanvasSize', () => {
    it('最大サイズ以下の場合は元のサイズを返す', () => {
      const result = calculateCanvasSize(800, 600, 2048)
      expect(result).toEqual({ width: 800, height: 600 })
    })

    it('幅が最大サイズを超える場合はリサイズする', () => {
      const result = calculateCanvasSize(4000, 3000, 2048)
      expect(result.width).toBeLessThanOrEqual(2048)
      expect(result.height).toBeLessThanOrEqual(2048)
      expect(result.width / result.height).toBeCloseTo(4000 / 3000, 2)
    })

    it('高さが最大サイズを超える場合はリサイズする', () => {
      const result = calculateCanvasSize(1500, 4000, 2048)
      expect(result.width).toBeLessThanOrEqual(2048)
      expect(result.height).toBeLessThanOrEqual(2048)
      expect(result.width / result.height).toBeCloseTo(1500 / 4000, 2)
    })

    it('アスペクト比を維持する', () => {
      const result = calculateCanvasSize(1600, 1200, 800)
      const originalRatio = 1600 / 1200
      const newRatio = result.width / result.height
      expect(newRatio).toBeCloseTo(originalRatio, 2)
    })
  })
})