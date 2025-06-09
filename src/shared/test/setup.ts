import '@testing-library/jest-dom'

// ImageData polyfill for jsdom
globalThis.ImageData = class ImageData {
  public data: Uint8ClampedArray
  public width: number
  public height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.data = new Uint8ClampedArray(width * height * 4)
  }
}

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