import React, { useRef, useEffect, useState } from 'react'
import { FaceDetectionResult } from '@/entities/face'

type FaceDetectionCanvasProps = {
  imageUrl: string | null
  detectionResult: FaceDetectionResult | null
  width?: number
  height?: number
  className?: string
}

export const FaceDetectionCanvas: React.FC<FaceDetectionCanvasProps> = ({
  imageUrl,
  detectionResult,
  width = 800,
  height = 600,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = new Image()
    image.onload = () => {
      // キャンバスサイズを画像に合わせて調整
      const aspectRatio = image.width / image.height
      let canvasWidth = width
      let canvasHeight = height

      if (aspectRatio > width / height) {
        canvasHeight = width / aspectRatio
      } else {
        canvasWidth = height * aspectRatio
      }

      canvas.width = canvasWidth
      canvas.height = canvasHeight
      setImageSize({ width: canvasWidth, height: canvasHeight })

      // 画像を描画
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight)

      // 顔検出結果を描画
      if (detectionResult && detectionResult.faces.length > 0) {
        drawFaceDetections(ctx, detectionResult, image.width, image.height, canvasWidth, canvasHeight)
      }
    }

    image.src = imageUrl
  }, [imageUrl, detectionResult, width, height])

  const drawFaceDetections = (
    ctx: CanvasRenderingContext2D,
    result: FaceDetectionResult,
    originalWidth: number,
    originalHeight: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // スケール比率を計算
    const scaleX = canvasWidth / originalWidth
    const scaleY = canvasHeight / originalHeight

    ctx.strokeStyle = '#ef4444' // 赤色
    ctx.lineWidth = 3
    ctx.fillStyle = '#ef4444' // 赤色（テキスト用）

    result.faces.forEach((face) => {
      // バウンディングボックスをキャンバス座標に変換
      const x = face.x * scaleX
      const y = face.y * scaleY
      const faceWidth = face.width * scaleX
      const faceHeight = face.height * scaleY

      // 円を描画（顔を囲む）- 枠のみ
      const centerX = x + faceWidth / 2
      const centerY = y + faceHeight / 2
      const radius = Math.max(faceWidth, faceHeight) / 2

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.stroke() // 塗りつぶしを削除、枠のみ

      // 顔番号を描画
      ctx.fillStyle = '#ef4444'
      ctx.font = '16px sans-serif'
      ctx.fillText(`顔 ${result.faces.indexOf(face) + 1}`, x, y - 5)
    })
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
        <div className="flex justify-center p-2">
          <canvas
            ref={canvasRef}
            className="border-none rounded-lg shadow-sm"
            style={{ maxWidth: 'none', maxHeight: 'none' }}
          />
        </div>
      </div>
      {imageSize.width > 0 && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          画像サイズ: {imageSize.width} × {imageSize.height}px (スクロールして全体を確認できます)
        </p>
      )}
    </div>
  )
}