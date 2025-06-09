export const imageToCanvas = (image: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context could not be created')
  }
  
  ctx.drawImage(image, 0, 0)
  return canvas
}

export const canvasToImageData = (canvas: HTMLCanvasElement): ImageData => {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context could not be created')
  }
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

export const downloadImage = async (
  canvas: HTMLCanvasElement,
  filename: string = 'processed-image.png',
  mimeType: string = 'image/png'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'))
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      resolve()
    }, mimeType, 0.9)
  })
}

export const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}