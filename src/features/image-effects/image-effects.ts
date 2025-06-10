import { FaceBox } from '@/entities/face'

export enum EffectType {
  BLUR = 'blur',
  MOSAIC = 'mosaic',
}

export enum EffectStrength {
  WEAK = 1,
  LIGHT = 2,
  MEDIUM = 3,
  STRONG = 4,
  VERY_STRONG = 5,
}

export interface ImageEffect {
  apply(canvas: HTMLCanvasElement, faces: FaceBox[], strength: EffectStrength): Promise<HTMLCanvasElement>
}

export class BlurEffect implements ImageEffect {
  getBlurRadius(strength: EffectStrength): number {
    const radiusMap: Record<EffectStrength, number> = {
      [EffectStrength.WEAK]: 2,
      [EffectStrength.LIGHT]: 4,
      [EffectStrength.MEDIUM]: 6,
      [EffectStrength.STRONG]: 8,
      [EffectStrength.VERY_STRONG]: 10,
    }
    return radiusMap[strength]
  }

  async apply(canvas: HTMLCanvasElement, faces: FaceBox[], strength: EffectStrength): Promise<HTMLCanvasElement> {
    if (faces.length === 0) {
      return canvas
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas context could not be created')
    }

    const blurRadius = this.getBlurRadius(strength)

    for (const face of faces) {
      ctx.save()
      
      // 顔領域をクリップ
      ctx.beginPath()
      ctx.rect(face.x, face.y, face.width, face.height)
      ctx.clip()
      
      // ぼかしフィルターを適用
      ctx.filter = `blur(${blurRadius}px)`
      ctx.drawImage(canvas, 0, 0)
      
      ctx.restore()
    }

    return canvas
  }
}

export class MosaicEffect implements ImageEffect {
  getPixelSize(strength: EffectStrength): number {
    const pixelSizeMap: Record<EffectStrength, number> = {
      [EffectStrength.WEAK]: 8,
      [EffectStrength.LIGHT]: 12,
      [EffectStrength.MEDIUM]: 16,
      [EffectStrength.STRONG]: 24,
      [EffectStrength.VERY_STRONG]: 32,
    }
    return pixelSizeMap[strength]
  }

  async apply(canvas: HTMLCanvasElement, faces: FaceBox[], strength: EffectStrength): Promise<HTMLCanvasElement> {
    if (faces.length === 0) {
      return canvas
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas context could not be created')
    }

    const pixelSize = this.getPixelSize(strength)

    for (const face of faces) {
      // 顔領域の境界を確実に設定
      const startX = Math.max(0, Math.floor(face.x))
      const startY = Math.max(0, Math.floor(face.y))
      const endX = Math.min(canvas.width, Math.ceil(face.x + face.width))
      const endY = Math.min(canvas.height, Math.ceil(face.y + face.height))
      const faceWidth = endX - startX
      const faceHeight = endY - startY

      if (faceWidth <= 0 || faceHeight <= 0) continue

      // 顔領域の画像データを取得
      const imageData = ctx.getImageData(startX, startY, faceWidth, faceHeight)
      const data = imageData.data

      // モザイク処理 - より効果的なアルゴリズム
      for (let y = 0; y < faceHeight; y += pixelSize) {
        for (let x = 0; x < faceWidth; x += pixelSize) {
          // ピクセルブロックの平均色を計算
          let r = 0, g = 0, b = 0, alpha = 0
          let count = 0

          // ブロック内の全ピクセルの色を平均化
          const blockEndY = Math.min(y + pixelSize, faceHeight)
          const blockEndX = Math.min(x + pixelSize, faceWidth)

          for (let dy = y; dy < blockEndY; dy++) {
            for (let dx = x; dx < blockEndX; dx++) {
              const index = (dy * faceWidth + dx) * 4
              if (index + 3 < data.length) {
                r += data[index]
                g += data[index + 1]
                b += data[index + 2]
                alpha += data[index + 3]
                count++
              }
            }
          }

          if (count > 0) {
            // 平均色を計算
            const avgR = Math.round(r / count)
            const avgG = Math.round(g / count)
            const avgB = Math.round(b / count)
            const avgA = Math.round(alpha / count)

            // ブロック全体を平均色で塗りつぶし
            for (let dy = y; dy < blockEndY; dy++) {
              for (let dx = x; dx < blockEndX; dx++) {
                const index = (dy * faceWidth + dx) * 4
                if (index + 3 < data.length) {
                  data[index] = avgR
                  data[index + 1] = avgG
                  data[index + 2] = avgB
                  data[index + 3] = avgA
                }
              }
            }
          }
        }
      }

      // 処理済み画像データをキャンバスに描画
      ctx.putImageData(imageData, startX, startY)
    }

    return canvas
  }
}

export class ImageEffectProcessor {
  private effects: Map<EffectType, ImageEffect>

  constructor() {
    this.effects = new Map<EffectType, ImageEffect>([
      [EffectType.BLUR, new BlurEffect()],
      [EffectType.MOSAIC, new MosaicEffect()],
    ])
  }

  async applyEffect(
    canvas: HTMLCanvasElement,
    faces: FaceBox[],
    effectType: EffectType,
    strength: EffectStrength
  ): Promise<HTMLCanvasElement> {
    const effect = this.effects.get(effectType)
    if (!effect) {
      throw new Error(`Unknown effect type: ${effectType}`)
    }

    return await effect.apply(canvas, faces, strength)
  }

  getSupportedEffects(): EffectType[] {
    return Array.from(this.effects.keys())
  }
}