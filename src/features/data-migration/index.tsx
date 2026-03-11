import { useState } from 'react'
import { Database } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useUser } from '@/client/provider'
import { Stepper } from './components/stepper'
import { StepContent } from './components/step-content'
import { ProcessArea } from './components/process-area'
import { NavigationButtons } from './components/navigation-buttons'
import { defaultFileUploadState } from './utils/constants'
import {
  canGoNext,
  createFileSelectHandler,
  createFileRemoveHandler,
} from './utils/migration'
import {
  migrateProducts,
  migrateSuppliers,
  migrateCustomers,
} from './migration/kiotviet'
import type { FileUploadState, ProcessLog } from './utils/types'

export function DataMigration() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const [currentStep, setCurrentStep] = useState(0)
  const [sourceSystem, setSourceSystem] = useState('')
  const [products, setProducts] = useState<FileUploadState>({ ...defaultFileUploadState })
  const [suppliers, setSuppliers] = useState<FileUploadState>({ ...defaultFileUploadState })
  const [customers, setCustomers] = useState<FileUploadState>({ ...defaultFileUploadState })

  const [productLocationId, setProductLocationId] = useState('')

  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<ProcessLog[]>([])

  const setterMap = { products: setProducts, suppliers: setSuppliers, customers: setCustomers }

  const handleFileSelect = (type: 'products' | 'suppliers' | 'customers') =>
    createFileSelectHandler(setterMap[type])

  const handleFileRemove = (type: 'products' | 'suppliers' | 'customers') =>
    createFileRemoveHandler(setterMap[type])

  const addLog = (log: Omit<ProcessLog, 'timestamp'>) => {
    setLogs((prev) => [...prev, { ...log, timestamp: new Date() }])
  }

  const handleStartMigration = async () => {
    if (!tenantId) return

    const hasSupplierFile = !!suppliers.file
    const hasProductFile = !!products.file
    const hasCustomerFile = !!customers.file

    if (!hasSupplierFile && !hasProductFile && !hasCustomerFile) {
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setLogs([])

    const totalSteps =
      (hasProductFile ? 1 : 0) +
      (hasSupplierFile ? 1 : 0) +
      (hasCustomerFile ? 1 : 0)
    let completedSteps = 0

    try {
      // Products - real migration
      if (hasProductFile) {
        await migrateProducts(products.file!, tenantId, productLocationId || null, addLog)
        completedSteps++
        setProgress((completedSteps / totalSteps) * 100)
      }

      // Suppliers - real migration
      if (hasSupplierFile) {
        await migrateSuppliers(suppliers.file!, tenantId, addLog)
        completedSteps++
        setProgress((completedSteps / totalSteps) * 100)
      }

      // Customers - real migration
      if (hasCustomerFile) {
        await migrateCustomers(customers.file!, tenantId, addLog)
        completedSteps++
        setProgress((completedSteps / totalSteps) * 100)
      }

      addLog({ message: 'Chuyển đổi dữ liệu hoàn tất!', type: 'success' })
      setProgress(100)
    } catch (error) {
      addLog({
        message: `Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}`,
        type: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
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
          productLocationId={productLocationId}
          onProductLocationChange={setProductLocationId}
          tenantId={tenantId}
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
          isCompleted={!isProcessing && progress === 100}
        />
      </Main>
    </>
  )
}
