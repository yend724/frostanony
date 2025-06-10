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

    // Face Detection モデルの初期化（複数人検出向け設定）
    try {
      this.detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4',
          modelType: 'short', // より高速で複数人検出に適している
          maxFaces: 10, // 最大10人まで検出可能
        }
      )
    } catch (mediapipeError) {
      console.warn('MediaPipe runtime failed, trying TensorFlow.js runtime:', mediapipeError)
      // TensorFlow.jsランタイムにフォールバック（複数人検出向け設定）
      this.detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: 'tfjs',
          modelType: 'short',
          maxFaces: 10,
        }
      )
    }

    this.initialized = true
    console.log('Face detection: Model initialized successfully')
  }

  async detectFaces(image: ImageData | HTMLImageElement | HTMLCanvasElement): Promise<FaceDetectionResult> {
    if (!this.detector || !this.initialized) {
      throw new Error('Face detector not initialized')
    }

    try {
      const predictions = await this.detector.estimateFaces(image)
      
      const faces: FaceBox[] = predictions.map(prediction => ({
        x: prediction.box.xMin,
        y: prediction.box.yMin,
        width: prediction.box.width,
        height: prediction.box.height,
      }))

      return {
        faces,
        count: faces.length,
      }
    } catch (error) {
      throw new Error('Face detection failed')
    }
  }

  isInitialized(): boolean {
    return this.initialized
  }

  dispose(): void {
    this.detector = null
    this.initialized = false
  }
}