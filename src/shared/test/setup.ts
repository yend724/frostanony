import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ImageData polyfill for jsdom
globalThis.ImageData = class ImageData {
  public data: Uint8ClampedArray
  public width: number
  public height: number
  public colorSpace: PredefinedColorSpace = 'srgb'

  constructor(
    dataOrWidth: Uint8ClampedArray | number,
    widthOrHeight?: number,
    height?: number
  ) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth
      this.height = widthOrHeight || 0
      this.data = new Uint8ClampedArray(this.width * this.height * 4)
    } else {
      this.data = dataOrWidth
      this.width = widthOrHeight || 0
      this.height = height || 0
    }
  }
} as typeof ImageData

// TensorFlow.jsのモック
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(undefined),
  setBackend: vi.fn().mockResolvedValue(true),
  getBackend: vi.fn().mockReturnValue('webgl'),
}))

vi.mock('@tensorflow-models/face-detection', () => ({
  SupportedModels: {
    MediaPipeFaceDetector: 'MediaPipeFaceDetector',
  },
  createDetector: vi.fn(),
}))