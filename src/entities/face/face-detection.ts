import * as tf from '@tensorflow/tfjs'
import * as faceDetection from '@tensorflow-models/face-detection'

export type FaceBox = {
  x: number
  y: number
  width: number
  height: number
}

export type FaceDetectionResult = {
  faces: FaceBox[]
  count: number
}

export class FaceDetector {
  private detector: faceDetection.FaceDetector | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    // ブラウザ環境チェック
    if (typeof window === 'undefined') {
      throw new Error('Face detection can only be initialized in browser environment')
    }

    try {
      // タイムアウト付きの初期化
      const initPromise = this.initializeInternal()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Face detection initialization timeout (30s)')), 30000)
      })

      await Promise.race([initPromise, timeoutPromise])
    } catch (error) {
      console.error('Face detection initialization error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Face detection model initialization failed: ${errorMessage}`)
    }
  }

  private async initializeInternal(): Promise<void> {
    // TensorFlow.jsの準備
    await tf.ready()

    // WebGLバックエンドを試行、失敗時はCPUにフォールバック
    try {
      await tf.setBackend('webgl')
      console.log('Face detection: WebGL backend initialized')
    } catch (webglError) {
      console.warn('Face detection: WebGL backend failed, falling back to CPU:', webglError)
      await tf.setBackend('cpu')
    }

    // Face Detection モデルの初期化（高精度設定）
    try {
      this.detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4',
          modelType: 'full', // より高精度なモデルを使用
          maxFaces: 10, // 最大10人まで検出可能
        }
      )
    } catch (mediapipeError) {
      console.warn('MediaPipe full model failed, trying short model:', mediapipeError)
      try {
        // フォールバック1: MediaPipe shortモデル
        this.detector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4',
            modelType: 'short',
            maxFaces: 10,
          }
        )
      } catch (shortModelError) {
        console.warn('MediaPipe short model failed, trying TensorFlow.js runtime:', shortModelError)
        // フォールバック2: TensorFlow.js ランタイム
        this.detector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: 'tfjs',
            modelType: 'short',
            maxFaces: 10,
          }
        )
      }
    }

    this.initialized = true
    console.log('Face detection: Model initialized successfully')
  }

  async detectFaces(image: ImageData | HTMLImageElement | HTMLCanvasElement): Promise<FaceDetectionResult> {
    if (!this.detector || !this.initialized) {
      throw new Error('Face detector not initialized')
    }

    try {
      // 高精度検出のための設定
      const predictions = await this.detector.estimateFaces(image, {
        flipHorizontal: false,
      })
      
      // バウンディングボックスサイズによるフィルタリング
      const filteredPredictions = predictions.filter(prediction => {
        const area = prediction.box.width * prediction.box.height
        const imageArea = this.getImageArea(image)
        const relativeSize = area / imageArea
        return relativeSize > 0.001 && relativeSize < 0.5 // 1%-50%の範囲
      })

      const faces: FaceBox[] = filteredPredictions.map(prediction => ({
        x: Math.max(0, prediction.box.xMin),
        y: Math.max(0, prediction.box.yMin),
        width: prediction.box.width,
        height: prediction.box.height,
      }))

      // 重複削除（IoU閾値ベース）
      const uniqueFaces = this.removeOverlappingFaces(faces)

      return {
        faces: uniqueFaces,
        count: uniqueFaces.length,
      }
    } catch (error) {
      console.error('Face detection error:', error)
      throw new Error('Face detection failed')
    }
  }

  private getImageArea(image: ImageData | HTMLImageElement | HTMLCanvasElement): number {
    if (image instanceof ImageData) {
      return image.width * image.height
    } else if (image instanceof HTMLImageElement) {
      return image.naturalWidth * image.naturalHeight
    } else if (image instanceof HTMLCanvasElement) {
      return image.width * image.height
    }
    return 1 // fallback
  }

  private removeOverlappingFaces(faces: FaceBox[]): FaceBox[] {
    if (faces.length <= 1) return faces

    const result: FaceBox[] = []
    const processed = new Set<number>()

    for (let i = 0; i < faces.length; i++) {
      if (processed.has(i)) continue

      let bestFace = faces[i]
      let bestArea = bestFace.width * bestFace.height

      // 同じような位置の顔をチェック
      for (let j = i + 1; j < faces.length; j++) {
        if (processed.has(j)) continue

        const iou = this.calculateIoU(faces[i], faces[j])
        if (iou > 0.3) { // 30%以上重複している場合
          processed.add(j)
          // より大きな顔を採用
          const area = faces[j].width * faces[j].height
          if (area > bestArea) {
            bestFace = faces[j]
            bestArea = area
          }
        }
      }

      result.push(bestFace)
      processed.add(i)
    }

    return result
  }

  private calculateIoU(box1: FaceBox, box2: FaceBox): number {
    const x1 = Math.max(box1.x, box2.x)
    const y1 = Math.max(box1.y, box2.y)
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width)
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height)

    if (x2 <= x1 || y2 <= y1) return 0

    const intersection = (x2 - x1) * (y2 - y1)
    const area1 = box1.width * box1.height
    const area2 = box2.width * box2.height
    const union = area1 + area2 - intersection

    return intersection / union
  }

  isInitialized(): boolean {
    return this.initialized
  }

  dispose(): void {
    this.detector = null
    this.initialized = false
  }
}