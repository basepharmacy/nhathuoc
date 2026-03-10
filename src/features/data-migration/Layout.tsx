import { useState } from 'react'
import { Database } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Stepper } from './components/stepper'
import { StepContent } from './components/step-content'
import { ProcessArea } from './components/process-area'
import { NavigationButtons } from './components/navigation-buttons'
import { defaultFileUploadState, dummyLogs } from './utils/constants'
import {
  canGoNext,
  createFileSelectHandler,
  createFileRemoveHandler,
  simulateMigration,
} from './utils/migration'
import type { FileUploadState, ProcessLog } from './utils/types'

export function DataMigrationLayout() {
  const [currentStep, setCurrentStep] = useState(0)
  const [sourceSystem, setSourceSystem] = useState('')
  const [products, setProducts] = useState<FileUploadState>({ ...defaultFileUploadState })
  const [suppliers, setSuppliers] = useState<FileUploadState>({ ...defaultFileUploadState })
  const [customers, setCustomers] = useState<FileUploadState>({ ...defaultFileUploadState })

  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<ProcessLog[]>([])

  const setterMap = { products: setProducts, suppliers: setSuppliers, customers: setCustomers }

  const handleFileSelect = (type: 'products' | 'suppliers' | 'customers') =>
    createFileSelectHandler(setterMap[type])

  const handleFileRemove = (type: 'products' | 'suppliers' | 'customers') =>
    createFileRemoveHandler(setterMap[type])

  const handleStartMigration = () => {
    simulateMigration(dummyLogs, setIsProcessing, setProgress, setLogs)
  }

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <Database className='size-5' />
            <h2 className='text-2xl font-bold tracking-tight'>
              Chuyển đổi dữ liệu
            </h2>
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <Stepper
          currentStep={currentStep}
          isProcessing={isProcessing}
          onStepClick={setCurrentStep}
        />

        <StepContent
          currentStep={currentStep}
          sourceSystem={sourceSystem}
          onSourceSystemChange={setSourceSystem}
          products={products}
          suppliers={suppliers}
          customers={customers}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
        />

        <ProcessArea
          isProcessing={isProcessing}
          progress={progress}
          logs={logs}
        />

        <NavigationButtons
          currentStep={currentStep}
          isProcessing={isProcessing}
          canGoNext={canGoNext(currentStep, sourceSystem)}
          onBack={() => setCurrentStep((s) => s - 1)}
          onNext={() => setCurrentStep((s) => s + 1)}
          onSkip={() => setCurrentStep((s) => s + 1)}
          onStartMigration={handleStartMigration}
        />
      </Main>
    </>
  )
}
