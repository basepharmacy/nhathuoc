import { ContentSection } from '../components/content-section'
import { TenantInfo } from './tenant-info'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Tài khoản hệ thống'
      desc='Thông tin tenant của hệ thống.'
    >
      <TenantInfo />
    </ContentSection>
  )
}
