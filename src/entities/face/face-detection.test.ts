import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FaceDetector } from './face-detection'
import * as faceDetection from '@tensorflow-models/face-detection'

// TensorFlow.jsのモック
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(undefined),
  setBackend: vi.fn().mockResolvedValue(true),
  getBackend: vi.fn().mockReturnValue('webgl'),
}))

// Face detectionのモック
vi.mock('@tensorflow-models/face-detection', () => ({
  SupportedModels: {
    MediaPipeFaceDetector: 'MediaPipeFaceDetector',
  },
  createDetector: vi.fn(),
}))

describe('FaceDetector', () => {
  let faceDetector: FaceDetector
  let mockDetector: unknown

  beforeEach(() => {
    // モックデータを作成
    mockDetector = {
      estimateFaces: vi.fn(),
    }

    // createDetectorのモックをリセット
    vi.mocked(faceDetection.createDetector).mockClear()
    vi.mocked(faceDetection.createDetector).mockResolvedValue(mockDetector)

    faceDetector = new FaceDetector()
  })

  describe('initialize', () => {
    it('TensorFlow.jsとface detectionモデルを正しく初期化する', async () => {
      await faceDetector.initialize()

      expect(faceDetection.createDetector).toHaveBeenCalledWith(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4',
        }
      )
    })

    it('既に初期化済みの場合は再初期化しない', async () => {
      await faceDetector.initialize()
      await faceDetector.initialize()

      expect(faceDetection.createDetector).toHaveBeenCalledTimes(1)
    })

    it('初期化に失敗した場合はエラーを投げる', async () => {
      vi.mocked(faceDetection.createDetector).mockRejectedValue(new Error('initialization failed'))

      await expect(faceDetector.initialize()).rejects.toThrow('Face detection model initialization failed')
    })
  })

  describe('detectFaces', () => {
    beforeEach(async () => {
      await faceDetector.initialize()
    })

    it('画像から顔を検出する', async () => {
      const mockFaces = [
        {
          box: { xMin: 100, yMin: 150, width: 200, height: 250 },
          keypoints: [],
        },
        {
          box: { xMin: 400, yMin: 200, width: 180, height: 220 },
          keypoints: [],
        },
      ]

      mockDetector.estimateFaces.mockResolvedValue(mockFaces)

      const mockImage = new ImageData(800, 600)
      const result = await faceDetector.detectFaces(mockImage)

      expect(mockDetector.estimateFaces).toHaveBeenCalledWith(mockImage)
      expect(result).toEqual({
        faces: [
          { x: 100, y: 150, width: 200, height: 250 },
          { x: 400, y: 200, width: 180, height: 220 },
        ],
        count: 2,
      })
    })

    it('顔が検出されない場合は空の結果を返す', async () => {
      mockDetector.estimateFaces.mockResolvedValue([])

      const mockImage = new ImageData(800, 600)
      const result = await faceDetector.detectFaces(mockImage)

      expect(result).toEqual({
        faces: [],
        count: 0,
      })
    })

    it('初期化されていない場合はエラーを投げる', async () => {
      const uninitializedDetector = new FaceDetector()
      const mockImage = new ImageData(800, 600)

      await expect(uninitializedDetector.detectFaces(mockImage)).rejects.toThrow(
        'Face detector not initialized'
      )
    })

    it('検出処理でエラーが発生した場合はエラーを投げる', async () => {
      mockDetector.estimateFaces.mockRejectedValue(new Error('detection failed'))

      const mockImage = new ImageData(800, 600)

      await expect(faceDetector.detectFaces(mockImage)).rejects.toThrow(
        'Face detection failed'
      )
    })
  })

  describe('isInitialized', () => {
    it('初期化前はfalseを返す', () => {
      expect(faceDetector.isInitialized()).toBe(false)
    })

    it('初期化後はtrueを返す', async () => {
      await faceDetector.initialize()
      expect(faceDetector.isInitialized()).toBe(true)
    })
  })
})