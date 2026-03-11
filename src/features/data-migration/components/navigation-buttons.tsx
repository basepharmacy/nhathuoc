import { ChevronLeft, ChevronRight, Loader2, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { steps } from '../utils/constants'

export function NavigationButtons({
  currentStep,
  isProcessing,
  canGoNext,
  onBack,
  onNext,
  onSkip,
  onStartMigration,
  isCompleted,
}: {
  currentStep: number
  isProcessing: boolean
  canGoNext: boolean
  onBack: () => void
  onNext: () => void
  onSkip: () => void
  onStartMigration: () => void
  isCompleted: boolean
}) {
  return (
    <div className='mx-auto flex w-full max-w-2xl items-center justify-between'>
      <Button
        variant='outline'
        onClick={onBack}
        disabled={currentStep === 0 || isProcessing}
      >
        <ChevronLeft className='size-4' />
        Quay lại
      </Button>

      <div className='flex items-center gap-2'>
        {currentStep >= 1 && currentStep < steps.length - 1 && (
          <Button
            variant='ghost'
            onClick={onSkip}
            disabled={isProcessing}
          >
            Bỏ qua
            <SkipForward className='size-4' />
          </Button>
        )}

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={onNext}
            disabled={!canGoNext || isProcessing}
          >
            Tiếp theo
            <ChevronRight className='size-4' />
          </Button>
        ) : !isCompleted ? (
          <Button
            onClick={onStartMigration}
            disabled={isProcessing}
          >
            {isProcessing && (
              <Loader2 className='size-4 animate-spin' />
            )}
            Bắt đầu chuyển đổi
          </Button>
        ) : null}
      </div>
    </div>
  )
}
