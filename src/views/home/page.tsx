'use client'

import { useState, useCallback, useEffect } from 'react'
import { useImageUpload, ImageUpload } from '@/features/image-upload'
import { useFaceDetection } from '@/features/face-detection'
import { EffectControls, EffectType, EffectStrength } from '@/features/image-effects'
import { useImageProcessor } from '@/features/image-processing'
import { ImagePreview, FaceDetectionCanvas } from '@/shared/ui'
import { createImageFromFile } from '@/shared/lib'

const HomePage: React.FC = () => {
  const { 
    image, 
    imageUrl, 
    isUploading, 
    error: uploadError, 
    handleFileSelect, 
    clearImage 
  } = useImageUpload()
  
  const {
    isInitialized,
    isDetecting,
    lastDetectionResult,
    error: detectionError,
    initialize: initializeFaceDetection,
    detectFaces,
  } = useFaceDetection()
  
  const {
    isProcessing,
    processedCanvas,
    error: processingError,
    processImage,
    reprocessImage,
    reset: resetProcessor,
  } = useImageProcessor()
  
  const [selectedEffect, setSelectedEffect] = useState<EffectType>(EffectType.BLUR)
  const [selectedStrength, setSelectedStrength] = useState<EffectStrength>(EffectStrength.MEDIUM)
  const [isApplied, setIsApplied] = useState(false)
  
  // 顔検出の初期化
  useEffect(() => {
    initializeFaceDetection()
  }, [initializeFaceDetection])
  
  // 画像がアップロードされたら自動的に顔検出を実行
  useEffect(() => {
    if (image && isInitialized) {
      const detectFacesInImage = async () => {
        try {
          const imageElement = await createImageFromFile(image)
          await detectFaces(imageElement)
        } catch (err) {
          console.error('顔検出エラー:', err)
        }
      }
      detectFacesInImage()
    }
  }, [image, isInitialized, detectFaces])
  
  // 適用ボタンのハンドラー
  const handleApply = useCallback(async () => {
    if (!image || !lastDetectionResult) return
    
    setIsApplied(true)
    await processImage(image, lastDetectionResult, selectedEffect, selectedStrength)
  }, [image, lastDetectionResult, selectedEffect, selectedStrength, processImage])
  
  // 再適用（エフェクトや強度変更時）
  const handleReapply = useCallback(async () => {
    if (!lastDetectionResult) return
    
    await reprocessImage(lastDetectionResult, selectedEffect, selectedStrength)
  }, [lastDetectionResult, selectedEffect, selectedStrength, reprocessImage])
  
  // エフェクト変更時の処理
  const handleEffectChange = useCallback((effect: EffectType) => {
    setSelectedEffect(effect)
    if (isApplied && lastDetectionResult) {
      handleReapply()
    }
  }, [isApplied, lastDetectionResult, handleReapply])
  
  // 強度変更時の処理
  const handleStrengthChange = useCallback((strength: EffectStrength) => {
    setSelectedStrength(strength)
    if (isApplied && lastDetectionResult) {
      handleReapply()
    }
  }, [isApplied, lastDetectionResult, handleReapply])
  
  // クリア処理
  const handleClear = useCallback(() => {
    clearImage()
    resetProcessor()
    setIsApplied(false)
  }, [clearImage, resetProcessor])
  
  const error = uploadError || detectionError || processingError
  const showStatusMessage = isDetecting || (lastDetectionResult && !isApplied)
  const statusMessage = isDetecting ? '顔を検出中...' : 
    lastDetectionResult && !isApplied ? `${lastDetectionResult.count}個の顔を検出しました` : ''

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Frostanony
          </h1>
          <p className="text-lg text-gray-600">
            顔画像を自動で匿名化するプライバシー保護ツール
          </p>
        </header>
        
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* アップロード・設定エリア */}
          <div className="space-y-6">
            <ImageUpload
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              error={error}
            />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">エフェクト設定</h2>
              <EffectControls
                selectedEffect={selectedEffect}
                selectedStrength={selectedStrength}
                onEffectChange={handleEffectChange}
                onStrengthChange={handleStrengthChange}
                disabled={!image || isProcessing}
              />
              
              <button 
                onClick={handleApply}
                disabled={!image || !lastDetectionResult || isProcessing || isDetecting}
                className={`
                  w-full mt-4 py-2 rounded-md transition-colors font-medium
                  ${image && lastDetectionResult && !isProcessing && !isDetecting
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }
                `}
              >
                {isProcessing ? '処理中...' : 
                 isDetecting ? '顔を検出中...' :
                 isApplied ? '再適用' : '適用'}
              </button>
            </div>
          </div>
          
          {/* プレビューエリア */}
          <div className="space-y-4">
            {/* 顔検出結果プレビュー */}
            {imageUrl && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {lastDetectionResult 
                      ? `顔検出結果 (${lastDetectionResult.count}個の顔を検出)`
                      : '画像プレビュー'
                    }
                  </h3>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    クリア
                  </button>
                </div>
                
                {lastDetectionResult ? (
                  <FaceDetectionCanvas
                    imageUrl={imageUrl}
                    detectionResult={lastDetectionResult}
                  />
                ) : (
                  <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
                    <div className="flex justify-center p-2">
                      <img
                        src={imageUrl}
                        alt="アップロード画像"
                        className="border-none rounded-lg shadow-sm"
                        style={{ maxWidth: 'none', maxHeight: 'none' }}
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement
                          if (img.naturalWidth > 0) {
                            console.log(`画像サイズ: ${img.naturalWidth} × ${img.naturalHeight}px`)
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 処理済み画像プレビュー */}
            {processedCanvas && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">処理済み画像</h3>
                <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
                  <div className="flex justify-center p-2">
                    <img
                      src={processedCanvas.toDataURL()}
                      alt="処理済み画像"
                      className="border-none rounded-lg shadow-sm"
                      style={{ maxWidth: 'none', maxHeight: 'none' }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  画像サイズ: {processedCanvas.width} × {processedCanvas.height}px (スクロールして全体を確認できます)
                </p>
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.download = 'anonymized-image.png'
                    link.href = processedCanvas.toDataURL()
                    link.click()
                  }}
                  className="w-full mt-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
                >
                  画像をダウンロード
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePage