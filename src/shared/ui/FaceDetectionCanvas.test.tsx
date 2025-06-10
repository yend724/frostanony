import { render, screen, act } from '@testing-library/react'
import { FaceDetectionCanvas } from './FaceDetectionCanvas'
import { FaceDetectionResult } from '@/entities/face'

// Canvas APIのモック
const mockGetContext = vi.fn()
const mockDrawImage = vi.fn()
const mockBeginPath = vi.fn()
const mockArc = vi.fn()
const mockFill = vi.fn()
const mockStroke = vi.fn()
const mockFillText = vi.fn()
const mockClearRect = vi.fn()

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext,
})

describe('FaceDetectionCanvas', () => {
  const mockContext = {
    drawImage: mockDrawImage,
    beginPath: mockBeginPath,
    arc: mockArc,
    fill: mockFill,
    stroke: mockStroke,
    fillText: mockFillText,
    clearRect: mockClearRect,
    strokeStyle: '',
    lineWidth: 0,
    fillStyle: '',
    font: '',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetContext.mockReturnValue(mockContext)

    // Image onloadのモック
    global.Image = class MockImage {
      onload: (() => void) | null = null
      src = ''
      width = 800
      height = 600

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload()
          }
        }, 0)
      }
    } as any
  })

  it('should render canvas element', () => {
    render(
      <FaceDetectionCanvas
        imageUrl="test-image.jpg"
        detectionResult={null}
      />
    )

    const canvas = screen.getByRole('img', { hidden: true })
    expect(canvas).toBeInTheDocument()
  })

  it('should not render anything when imageUrl is null', () => {
    render(
      <FaceDetectionCanvas
        imageUrl={null}
        detectionResult={null}
      />
    )

    const canvas = screen.getByRole('img', { hidden: true })
    expect(canvas).toBeInTheDocument()
    expect(mockDrawImage).not.toHaveBeenCalled()
  })

  it('should draw image without face detection when no faces detected', async () => {
    const detectionResult: FaceDetectionResult = {
      count: 0,
      faces: [],
    }

    render(
      <FaceDetectionCanvas
        imageUrl="test-image.jpg"
        detectionResult={detectionResult}
      />
    )

    // 非同期でImage.onloadが呼ばれるのを待つ
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    expect(mockDrawImage).toHaveBeenCalled()
    expect(mockArc).not.toHaveBeenCalled()
  })

  it('should draw face detection circles when faces are detected', async () => {
    const detectionResult: FaceDetectionResult = {
      count: 2,
      faces: [
        { x: 100, y: 100, width: 50, height: 50 },
        { x: 200, y: 150, width: 60, height: 60 },
      ],
    }

    render(
      <FaceDetectionCanvas
        imageUrl="test-image.jpg"
        detectionResult={detectionResult}
      />
    )

    // 非同期でImage.onloadが呼ばれるのを待つ
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    expect(mockDrawImage).toHaveBeenCalled()
    expect(mockArc).toHaveBeenCalledTimes(2) // 2つの顔に対して円を描画
    expect(mockStroke).toHaveBeenCalledTimes(2) // 枠のみ描画
    expect(mockFillText).toHaveBeenCalledWith('顔 1', expect.any(Number), expect.any(Number))
    expect(mockFillText).toHaveBeenCalledWith('顔 2', expect.any(Number), expect.any(Number))
  })

  it('should handle multiple faces (up to 10 people)', async () => {
    const detectionResult: FaceDetectionResult = {
      count: 5,
      faces: [
        { x: 100, y: 100, width: 50, height: 50 },
        { x: 200, y: 150, width: 60, height: 60 },
        { x: 300, y: 200, width: 55, height: 55 },
        { x: 400, y: 250, width: 45, height: 45 },
        { x: 500, y: 300, width: 65, height: 65 },
      ],
    }

    render(
      <FaceDetectionCanvas
        imageUrl="test-image.jpg"
        detectionResult={detectionResult}
      />
    )

    // 非同期でImage.onloadが呼ばれるのを待つ
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    expect(mockDrawImage).toHaveBeenCalled()
    expect(mockArc).toHaveBeenCalledTimes(5) // 5つの顔に対して円を描画
    expect(mockStroke).toHaveBeenCalledTimes(5) // 枠のみ描画
    expect(mockFillText).toHaveBeenCalledWith('顔 1', expect.any(Number), expect.any(Number))
    expect(mockFillText).toHaveBeenCalledWith('顔 2', expect.any(Number), expect.any(Number))
    expect(mockFillText).toHaveBeenCalledWith('顔 3', expect.any(Number), expect.any(Number))
    expect(mockFillText).toHaveBeenCalledWith('顔 4', expect.any(Number), expect.any(Number))
    expect(mockFillText).toHaveBeenCalledWith('顔 5', expect.any(Number), expect.any(Number))
  })

  it('should apply custom width and height', () => {
    render(
      <FaceDetectionCanvas
        imageUrl="test-image.jpg"
        detectionResult={null}
        width={400}
        height={300}
      />
    )

    const canvas = screen.getByRole('img', { hidden: true })
    expect(canvas).toHaveStyle({ maxWidth: '400px', maxHeight: '300px' })
  })

  it('should apply custom className', () => {
    render(
      <FaceDetectionCanvas
        imageUrl="test-image.jpg"
        detectionResult={null}
        className="custom-class"
      />
    )

    const container = screen.getByRole('img', { hidden: true }).closest('.custom-class')
    expect(container).toBeInTheDocument()
  })

  it('should handle canvas context not available', () => {
    mockGetContext.mockReturnValue(null)

    render(
      <FaceDetectionCanvas
        imageUrl="test-image.jpg"
        detectionResult={null}
      />
    )

    // エラーが発生しないことを確認
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
  })
})