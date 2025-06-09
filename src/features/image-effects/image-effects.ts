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
      [EffectStrength.WEAK]: 4,
      [EffectStrength.LIGHT]: 8,
      [EffectStrength.MEDIUM]: 12,
      [EffectStrength.STRONG]: 16,
      [EffectStrength.VERY_STRONG]: 20,
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
      // 顔領域の画像データを取得
      const imageData = ctx.getImageData(face.x, face.y, face.width, face.height)
      const data = imageData.data

      // モザイク処理
      for (let y = 0; y < face.height; y += pixelSize) {
        for (let x = 0; x < face.width; x += pixelSize) {
          // ピクセルブロックの平均色を計算
          let r = 0, g = 0, b = 0, a = 0
          let count = 0

          for (let dy = 0; dy < pixelSize && y + dy < face.height; dy++) {
            for (let dx = 0; dx < pixelSize && x + dx < face.width; dx++) {
              const index = ((y + dy) * face.width + (x + dx)) * 4
              if (index < data.length) {
                r += data[index]
                g += data[index + 1]
                b += data[index + 2]
                a += data[index + 3]
                count++
              }
            }
          }

          if (count > 0) {
            r = Math.floor(r / count)
            g = Math.floor(g / count)
            b = Math.floor(b / count)
            a = Math.floor(a / count)

            // ピクセルブロック全体を平均色で塗りつぶし
            for (let dy = 0; dy < pixelSize && y + dy < face.height; dy++) {
              for (let dx = 0; dx < pixelSize && x + dx < face.width; dx++) {
                const index = ((y + dy) * face.width + (x + dx)) * 4
                if (index < data.length) {
                  data[index] = r
                  data[index + 1] = g
                  data[index + 2] = b
                  data[index + 3] = a
                }
              }
            }
          }
        }
      }

      // 処理済み画像データをキャンバスに描画
      ctx.putImageData(imageData, face.x, face.y)
    }

    return canvas
  }
}

export class ImageEffectProcessor {
  private effects: Map<EffectType, ImageEffect>

  constructor() {
    this.effects = new Map([
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