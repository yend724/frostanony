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

    try {
      // TensorFlow.jsの準備
      await tf.ready()
      await tf.setBackend('webgl')

      // Face Detection モデルの初期化
      this.detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
        }
      )

      this.initialized = true
    } catch (error) {
      throw new Error('Face detection model initialization failed')
    }
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