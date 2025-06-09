import { describe, it, expect, beforeEach, vi } from 'vitest'
import { imageToCanvas, canvasToImageData, downloadImage } from './image-utils'

// HTMLCanvasElementとCanvasRenderingContext2Dのモック
const mockGetContext = vi.fn()
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: mockGetContext,
  toBlob: vi.fn(),
} as unknown as HTMLCanvasElement

const mockContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  canvas: mockCanvas,
} as unknown as CanvasRenderingContext2D

// URLのモック
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
})

// documentのモック
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
}

const mockBody = {
  appendChild: vi.fn(),
  removeChild: vi.fn(),
}

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas
      if (tagName === 'a') return mockLink
      return {}
    }),
    body: mockBody,
  },
  writable: true,
})

describe('image-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetContext.mockReturnValue(mockContext)
  })

  describe('imageToCanvas', () => {
    it('画像をCanvasに描画する', () => {
      const mockImage = {
        width: 800,
        height: 600,
      } as HTMLImageElement

      const canvas = imageToCanvas(mockImage)

      expect(document.createElement).toHaveBeenCalledWith('canvas')
      expect(canvas.width).toBe(800)
      expect(canvas.height).toBe(600)
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0)
    })

    it('getContextがnullの場合はエラーを投げる', () => {
      mockGetContext.mockReturnValue(null)

      const mockImage = {
        width: 800,
        height: 600,
      } as HTMLImageElement

      expect(() => imageToCanvas(mockImage)).toThrow('Canvas context could not be created')
    })
  })

  describe('canvasToImageData', () => {
    it('CanvasからImageDataを取得する', () => {
      const mockImageData = new ImageData(800, 600)
      mockContext.getImageData.mockReturnValue(mockImageData)

      mockCanvas.width = 800
      mockCanvas.height = 600

      const result = canvasToImageData(mockCanvas)

      expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 800, 600)
      expect(result).toBe(mockImageData)
    })

    it('getContextがnullの場合はエラーを投げる', () => {
      mockGetContext.mockReturnValue(null)

      expect(() => canvasToImageData(mockCanvas)).toThrow('Canvas context could not be created')
    })
  })

  describe('downloadImage', () => {
    it('Canvasから画像をダウンロードする', async () => {
      const mockBlob = new Blob(['mock'], { type: 'image/png' })
      mockCanvas.toBlob.mockImplementation((callback) => {
        callback(mockBlob)
      })

      await downloadImage(mockCanvas, 'test-image.png')

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png', 0.9)
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(mockLink.href).toBe('blob:mock-url')
      expect(mockLink.download).toBe('test-image.png')
      expect(mockLink.click).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('toBlobがnullを返した場合はエラーを投げる', async () => {
      mockCanvas.toBlob.mockImplementation((callback) => {
        callback(null)
      })

      await expect(downloadImage(mockCanvas, 'test.png')).rejects.toThrow('Failed to create blob from canvas')
    })

    it('ファイル名が指定されない場合はデフォルト名を使用する', async () => {
      const mockBlob = new Blob(['mock'], { type: 'image/png' })
      mockCanvas.toBlob.mockImplementation((callback) => {
        callback(mockBlob)
      })

      await downloadImage(mockCanvas)

      expect(mockLink.download).toBe('processed-image.png')
    })

    it('JPEG形式の場合は適切なMIMEタイプを使用する', async () => {
      const mockBlob = new Blob(['mock'], { type: 'image/jpeg' })
      mockCanvas.toBlob.mockImplementation((callback) => {
        callback(mockBlob)
      })

      await downloadImage(mockCanvas, 'test.jpg', 'image/jpeg')

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.9)
    })
  })
})