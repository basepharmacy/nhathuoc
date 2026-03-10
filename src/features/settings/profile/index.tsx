import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Thông tin tài khoản'
      desc='Quản lý thông tin tài khoản của bạn ở đây.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
