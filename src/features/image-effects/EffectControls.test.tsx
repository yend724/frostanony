import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EffectControls } from './EffectControls'
import { EffectType, EffectStrength } from './image-effects'

describe('EffectControls', () => {
  const mockOnEffectChange = vi.fn()
  const mockOnStrengthChange = vi.fn()

  const defaultProps = {
    selectedEffect: EffectType.BLUR,
    selectedStrength: EffectStrength.MEDIUM,
    onEffectChange: mockOnEffectChange,
    onStrengthChange: mockOnStrengthChange,
    disabled: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('エフェクト選択', () => {
    it('ぼかしとモザイクのラジオボタンが表示される', () => {
      render(<EffectControls {...defaultProps} />)

      expect(screen.getByLabelText('ぼかし')).toBeInTheDocument()
      expect(screen.getByLabelText('モザイク')).toBeInTheDocument()
    })

    it('選択されたエフェクトがチェックされている', () => {
      render(<EffectControls {...defaultProps} />)

      const blurRadio = screen.getByLabelText('ぼかし') as HTMLInputElement
      const mosaicRadio = screen.getByLabelText('モザイク') as HTMLInputElement

      expect(blurRadio.checked).toBe(true)
      expect(mosaicRadio.checked).toBe(false)
    })

    it('エフェクトを変更するとコールバックが呼ばれる', () => {
      render(<EffectControls {...defaultProps} />)

      const mosaicRadio = screen.getByLabelText('モザイク')
      fireEvent.click(mosaicRadio)

      expect(mockOnEffectChange).toHaveBeenCalledWith(EffectType.MOSAIC)
    })

    it('無効化されている場合はラジオボタンが無効になる', () => {
      render(<EffectControls {...defaultProps} disabled={true} />)

      const blurRadio = screen.getByLabelText('ぼかし') as HTMLInputElement
      const mosaicRadio = screen.getByLabelText('モザイク') as HTMLInputElement

      expect(blurRadio.disabled).toBe(true)
      expect(mosaicRadio.disabled).toBe(true)
    })
  })

  describe('強度調整', () => {
    it('強度スライダーが表示される', () => {
      render(<EffectControls {...defaultProps} />)

      const slider = screen.getByRole('slider', { name: /強度/ })
      expect(slider).toBeInTheDocument()
    })

    it('スライダーの範囲が1から5である', () => {
      render(<EffectControls {...defaultProps} />)

      const slider = screen.getByRole('slider') as HTMLInputElement
      expect(slider.min).toBe('1')
      expect(slider.max).toBe('5')
    })

    it('選択された強度が表示される', () => {
      render(<EffectControls {...defaultProps} />)

      const slider = screen.getByRole('slider') as HTMLInputElement
      expect(slider.value).toBe('3')
    })

    it('スライダーを動かすとコールバックが呼ばれる', () => {
      render(<EffectControls {...defaultProps} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '4' } })

      expect(mockOnStrengthChange).toHaveBeenCalledWith(4)
    })

    it('無効化されている場合はスライダーが無効になる', () => {
      render(<EffectControls {...defaultProps} disabled={true} />)

      const slider = screen.getByRole('slider') as HTMLInputElement
      expect(slider.disabled).toBe(true)
    })
  })

  describe('視覚的なフィードバック', () => {
    it('弱と強のラベルが表示される', () => {
      render(<EffectControls {...defaultProps} />)

      expect(screen.getByText('弱')).toBeInTheDocument()
      expect(screen.getByText('強')).toBeInTheDocument()
    })

    it('現在の強度レベルが視覚的に表示される', () => {
      const { rerender } = render(<EffectControls {...defaultProps} />)

      expect(screen.getByText('中程度')).toBeInTheDocument()

      rerender(<EffectControls {...defaultProps} selectedStrength={EffectStrength.WEAK} />)
      expect(screen.getByText('弱い')).toBeInTheDocument()

      rerender(<EffectControls {...defaultProps} selectedStrength={EffectStrength.VERY_STRONG} />)
      expect(screen.getByText('とても強い')).toBeInTheDocument()
    })
  })
})