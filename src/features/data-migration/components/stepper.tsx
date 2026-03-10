import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { steps } from '../utils/constants'

export function Stepper({
  currentStep,
  isProcessing,
  onStepClick,
}: {
  currentStep: number
  isProcessing: boolean
  onStepClick: (step: number) => void
}) {
  return (
    <div className='flex items-center justify-center gap-2'>
      {steps.map((step, index) => (
        <div key={step.title} className='flex items-center gap-2'>
          <button
            onClick={() => {
              if (index < currentStep && !isProcessing)
                onStepClick(index)
            }}
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              index === currentStep &&
                'bg-primary text-primary-foreground',
              index < currentStep &&
                'cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300',
              index > currentStep && 'bg-muted text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-bold',
                index === currentStep &&
                  'bg-primary-foreground text-primary',
                index < currentStep && 'bg-green-600 text-white',
                index > currentStep &&
                  'bg-muted-foreground/20 text-muted-foreground'
              )}
            >
              {index < currentStep ? (
                <Check className='size-3.5' />
              ) : (
                index + 1
              )}
            </span>
            <span className='hidden sm:inline'>{step.title}</span>
          </button>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-px w-8 sm:w-12',
                index < currentStep ? 'bg-green-400' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
