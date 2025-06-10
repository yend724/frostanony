'use client'

import { EffectType, EffectStrength } from './image-effects'

type EffectControlsProps = {
  selectedEffect: EffectType
  selectedStrength: EffectStrength
  onEffectChange: (effect: EffectType) => void
  onStrengthChange: (strength: EffectStrength) => void
  disabled?: boolean
}

const strengthLabels: Record<EffectStrength, string> = {
  [EffectStrength.WEAK]: '弱い',
  [EffectStrength.LIGHT]: 'やや弱い',
  [EffectStrength.MEDIUM]: '中程度',
  [EffectStrength.STRONG]: 'やや強い',
  [EffectStrength.VERY_STRONG]: 'とても強い',
}

export const EffectControls: React.FC<EffectControlsProps> = ({
  selectedEffect,
  selectedStrength,
  onEffectChange,
  onStrengthChange,
  disabled = false,
}) => {
  const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStrengthChange(Number(e.target.value) as EffectStrength)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium mb-2 text-gray-800">エフェクトの種類</p>
        <div className="space-y-2">
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="effect"
              value={EffectType.BLUR}
              checked={selectedEffect === EffectType.BLUR}
              onChange={() => onEffectChange(EffectType.BLUR)}
              disabled={disabled}
              className="mr-2 text-primary-500 focus:ring-primary-500"
            />
            ぼかし
          </label>
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="effect"
              value={EffectType.MOSAIC}
              checked={selectedEffect === EffectType.MOSAIC}
              onChange={() => onEffectChange(EffectType.MOSAIC)}
              disabled={disabled}
              className="mr-2 text-primary-500 focus:ring-primary-500"
            />
            モザイク
          </label>
        </div>
      </div>

      <div>
        <p className="font-medium mb-2 text-gray-800">強度</p>
        <input
          type="range"
          min="1"
          max="5"
          value={selectedStrength}
          onChange={handleStrengthChange}
          disabled={disabled}
          className="w-full accent-primary-500"
          aria-label="強度"
        />
        <div className="flex justify-between text-sm text-gray-800 mt-1 font-medium">
          <span>弱</span>
          <span>強</span>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {strengthLabels[selectedStrength]}
          </span>
        </div>
      </div>
    </div>
  )
}