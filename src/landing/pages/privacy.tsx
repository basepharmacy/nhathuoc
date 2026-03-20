import { LandingHeader } from '../components/header'
import { LandingFooter } from '../components/footer'
import '../landing.css'

const sections = [
  {
    key: 'intro',
    title: 'Chính Sách Bảo Mật',
    body: 'Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn khi bạn sử dụng ứng dụng. Vui lòng đọc kỹ chính sách này.',
  },
  {
    key: 'collection',
    title: '1. Thu thập dữ liệu',
    body: 'Chúng tôi có thể thu thập thông tin cá nhân mà bạn tự nguyện cung cấp khi đăng ký hoặc sử dụng các tính năng nhất định. Thông tin này có thể bao gồm tên, email, dữ liệu sử dụng và thông tin thiết bị.',
  },
  {
    key: 'usage',
    title: '2. Cách chúng tôi sử dụng dữ liệu',
    body: 'Dữ liệu thu thập được sử dụng để vận hành các tính năng cốt lõi, cải thiện trải nghiệm người dùng, cá nhân hóa nội dung, hỗ trợ khách hàng, tăng cường bảo mật và tuân thủ các nghĩa vụ pháp lý.',
  },
  {
    key: 'sharing',
    title: '3. Chia sẻ dữ liệu',
    body: 'Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi có thể chia sẻ dữ liệu hạn chế với các nhà cung cấp dịch vụ chỉ để phục vụ chức năng ứng dụng (ví dụ: phân tích, báo cáo lỗi) theo các cam kết bảo mật.',
  },
  {
    key: 'security',
    title: '4. Bảo mật',
    body: 'Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức hợp lý để bảo vệ dữ liệu; tuy nhiên, không có phương thức truyền tải hoặc lưu trữ nào an toàn 100%. Người dùng được khuyến khích sử dụng mật khẩu mạnh và giữ bí mật thông tin đăng nhập.',
  },
  {
    key: 'rights',
    title: '5. Quyền của bạn',
    body: 'Tùy thuộc vào quy định pháp luật, bạn có thể có quyền truy cập, chỉnh sửa, xóa hoặc hạn chế việc xử lý dữ liệu cá nhân của mình. Vui lòng liên hệ bộ phận hỗ trợ để gửi yêu cầu.',
  },
  {
    key: 'changes',
    title: '6. Thay đổi chính sách',
    body: 'Chúng tôi có thể cập nhật chính sách này theo định kỳ. Các thay đổi quan trọng sẽ được thông báo qua ứng dụng hoặc ghi chú phiên bản. Việc tiếp tục sử dụng sau khi thay đổi đồng nghĩa với việc bạn chấp nhận chính sách mới.',
  },
  {
    key: 'contact',
    title: '7. Liên hệ',
    body: 'Nếu bạn có câu hỏi hoặc thắc mắc về chính sách này, vui lòng liên hệ chúng tôi qua mục hỗ trợ trong ứng dụng.',
  },
]

export function LandingPrivacy() {
  return (
    <div className='landing-page min-h-dvh'>
      <LandingHeader />
      <main className='mx-auto max-w-2xl px-4 py-8'>
        <h1 className='mb-6 text-3xl font-bold'>{sections[0].title}</h1>
        {sections.map((section) => (
          <section key={section.key} className='mb-6'>
            {section.key !== 'intro' && (
              <h2 className='mb-2 text-xl font-semibold'>{section.title}</h2>
            )}
            <p className='whitespace-pre-line text-[var(--lp-on-surface-variant)]'>
              {section.body}
            </p>
          </section>
        ))}
      </main>
      <LandingFooter />
    </div>
  )
}
