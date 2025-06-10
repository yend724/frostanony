'use client'

import { useState, useCallback, useEffect } from 'react'
import { useImageUpload, ImageUpload } from '@/features/image-upload'
import { useFaceDetection } from '@/features/face-detection'
import { EffectControls, EffectType, EffectStrength } from '@/features/image-effects'
import { useImageProcessor } from '@/features/image-processing'
import { FaceDetectionCanvas, ToastContainer, useToast } from '@/shared/ui'
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
  
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast()
  
  // ブラウザサポートチェック
  useEffect(() => {
    const checkBrowserSupport = () => {
      const unsupportedFeatures = []
      
      if (!window.URL || !window.URL.createObjectURL) {
        unsupportedFeatures.push('ファイル読み込み')
      }
      
      if (!document.createElement('canvas').getContext('2d')) {
        unsupportedFeatures.push('Canvas API')
      }
      
      if (!window.WebGLRenderingContext) {
        showWarning('WebGL がサポートされていません', '処理速度が低下する可能性があります')
      }
      
      if (unsupportedFeatures.length > 0) {
        showError(
          `このブラウザは一部機能をサポートしていません`,
          `非対応機能: ${unsupportedFeatures.join(', ')}`
        )
      }
    }
    
    checkBrowserSupport()
  }, [showError, showWarning])
  
  // 顔検出の初期化
  useEffect(() => {
    const initializeDetection = async () => {
      try {
        await initializeFaceDetection()
      } catch {
        showError('顔検出の初期化に失敗しました', '再度ページを読み込んでください')
      }
    }
    initializeDetection()
  }, [initializeFaceDetection, showError])
  
  // 画像がアップロードされたら自動的に顔検出を実行
  useEffect(() => {
    if (image && isInitialized) {
      const detectFacesInImage = async () => {
        try {
          const imageElement = await createImageFromFile(image)
          const result = await detectFaces(imageElement)
          if (result && result.count > 0) {
            showSuccess(`${result.count}件の顔を検出しました`)
          } else {
            showWarning('顔が検出されませんでした', '画像を確認してください')
          }
        } catch (err) {
          console.error('顔検出エラー:', err)
          showError('顔検出に失敗しました', '画像形式を確認してください')
        }
      }
      detectFacesInImage()
    }
  }, [image, isInitialized, detectFaces, showSuccess, showWarning, showError])
  
  // 適用ボタンのハンドラー
  const handleApply = useCallback(async () => {
    if (!image || !lastDetectionResult) return
    
    try {
      setIsApplied(true)
      await processImage(image, lastDetectionResult, selectedEffect, selectedStrength)
      showSuccess('エフェクトを適用しました')
    } catch (err) {
      console.error('画像処理エラー:', err)
      showError('エフェクトの適用に失敗しました', '再度お試しください')
      setIsApplied(false)
    }
  }, [image, lastDetectionResult, selectedEffect, selectedStrength, processImage, showSuccess, showError])
  
  
  // エフェクト変更時の処理
  const handleEffectChange = useCallback(async (effect: EffectType) => {
    setSelectedEffect(effect)
    if (isApplied && lastDetectionResult) {
      try {
        await reprocessImage(lastDetectionResult, effect, selectedStrength)
      } catch (err) {
        console.error('エフェクト変更時の再処理エラー:', err)
        showError('エフェクトの変更に失敗しました', '再度お試しください')
      }
    }
  }, [isApplied, lastDetectionResult, selectedStrength, reprocessImage, showError])
  
  // 強度変更時の処理（デバウンス付き）
  const [strengthChangeTimeout, setStrengthChangeTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const handleStrengthChange = useCallback(async (strength: EffectStrength) => {
    setSelectedStrength(strength)
    
    // 既存のタイムアウトをクリア
    if (strengthChangeTimeout) {
      clearTimeout(strengthChangeTimeout)
    }
    
    if (isApplied && lastDetectionResult) {
      // デバウンス：300ms後に処理実行
      const timeoutId = setTimeout(async () => {
        try {
          await reprocessImage(lastDetectionResult, selectedEffect, strength)
        } catch (err) {
          console.error('強度変更時の再処理エラー:', err)
          showError('強度の変更に失敗しました', '再度お試しください')
        }
      }, 300)
      
      setStrengthChangeTimeout(timeoutId)
    }
  }, [isApplied, lastDetectionResult, selectedEffect, reprocessImage, showError, strengthChangeTimeout])
  
  // クリア処理
  const handleClear = useCallback(() => {
    // 進行中のタイムアウトをクリア
    if (strengthChangeTimeout) {
      clearTimeout(strengthChangeTimeout)
      setStrengthChangeTimeout(null)
    }
    
    clearImage()
    resetProcessor()
    setIsApplied(false)
  }, [clearImage, resetProcessor, strengthChangeTimeout])
  
  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (strengthChangeTimeout) {
        clearTimeout(strengthChangeTimeout)
      }
    }
  }, [strengthChangeTimeout])
  
  const error = uploadError || detectionError || processingError

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Frostanony
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4 sm:px-0">
            顔画像を自動で匿名化するプライバシー保護ツール
          </p>
        </header>
        
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* アップロード・設定エリア */}
          <div className="space-y-4 sm:space-y-6">
            <ImageUpload
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              error={error}
            />
            
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">
                エフェクト設定
              </h2>
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
                  w-full mt-4 py-3 sm:py-2 rounded-md transition-colors font-medium text-sm sm:text-base
                  touch-manipulation
                  ${image && lastDetectionResult && !isProcessing && !isDetecting
                    ? 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }
                `}
              >
                {isProcessing ? 'エフェクト適用中...' : 
                 isDetecting ? '顔を検出中...' :
                 isApplied ? 'エフェクトを再適用' : 'エフェクトを適用'}
              </button>
            </div>
          </div>
          
          {/* プレビューエリア */}
          <div className="space-y-4 sm:space-y-6">
            {/* 顔検出結果プレビュー */}
            {imageUrl && (
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {lastDetectionResult 
                      ? `顔検出結果 (${lastDetectionResult.count})`
                      : '画像プレビュー'
                    }
                  </h3>
                  <button
                    onClick={handleClear}
                    className="px-3 sm:px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 active:bg-gray-700 transition-colors touch-manipulation w-full sm:w-auto"
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
                  <div className="overflow-auto max-h-64 sm:max-h-80 lg:max-h-96 border border-gray-200 rounded-lg">
                    <div className="p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="アップロード画像"
                        className="border-none rounded-lg shadow-sm block mx-auto max-w-full h-auto"
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
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-900">
                  処理済み画像
                </h3>
                <div className="overflow-auto max-h-64 sm:max-h-80 lg:max-h-96 border border-gray-200 rounded-lg">
                  <div className="p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={processedCanvas.toDataURL()}
                      alt="処理済み画像"
                      className="border-none rounded-lg shadow-sm block mx-auto max-w-full h-auto"
                    />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center px-2">
                  画像サイズ: {processedCanvas.width} × {processedCanvas.height}px
                  <span className="hidden sm:inline"> (スクロールして全体を確認できます)</span>
                </p>
                <button
                  onClick={() => {
                    try {
                      const link = document.createElement('a')
                      link.download = 'anonymized-image.png'
                      link.href = processedCanvas.toDataURL()
                      link.click()
                      showSuccess('画像をダウンロードしました')
                    } catch (err) {
                      console.error('ダウンロードエラー:', err)
                      showError('ダウンロードに失敗しました', '再度お試しください')
                    }
                  }}
                  className="w-full mt-3 sm:mt-4 py-3 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
                >
                  📱 画像をダウンロード
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </main>
  )
}

export default HomePage