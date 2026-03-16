import { Link } from '@tanstack/react-router'

export function PrivacyPolicy() {
  return (
    <div className='min-h-svh bg-background'>
      <div className='mx-auto max-w-3xl px-6 py-16'>
        <h1 className='text-3xl font-bold'>Chính sách bảo mật</h1>
        <p className='mt-4 text-muted-foreground'>
          Cập nhật lần cuối: 16/03/2026
        </p>

        <div className='mt-8 space-y-8'>
          <section>
            <h2 className='text-xl font-semibold'>1. Thu thập thông tin</h2>
            <p className='mt-2 text-muted-foreground'>
              Chúng tôi thu thập các thông tin cần thiết khi bạn sử dụng dịch
              vụ, bao gồm: họ tên, số điện thoại, email, địa chỉ cửa hàng và
              thông tin liên quan đến hoạt động kinh doanh nhà thuốc của bạn.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>2. Sử dụng thông tin</h2>
            <p className='mt-2 text-muted-foreground'>
              Thông tin của bạn được sử dụng để:
            </p>
            <ul className='mt-2 list-inside list-disc space-y-1 text-muted-foreground'>
              <li>Cung cấp và duy trì dịch vụ quản lý nhà thuốc</li>
              <li>Hỗ trợ khách hàng và xử lý yêu cầu</li>
              <li>Cải thiện chất lượng sản phẩm và dịch vụ</li>
              <li>Gửi thông báo quan trọng về tài khoản và dịch vụ</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>3. Bảo vệ thông tin</h2>
            <p className='mt-2 text-muted-foreground'>
              Chúng tôi áp dụng các biện pháp bảo mật phù hợp để bảo vệ thông
              tin cá nhân của bạn khỏi truy cập trái phép, thay đổi, tiết lộ
              hoặc phá hủy. Dữ liệu được mã hóa trong quá trình truyền tải và
              lưu trữ.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>4. Chia sẻ thông tin</h2>
            <p className='mt-2 text-muted-foreground'>
              Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân
              của bạn cho bên thứ ba mà không có sự đồng ý của bạn, trừ khi
              được yêu cầu bởi pháp luật.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>5. Lưu trữ dữ liệu</h2>
            <p className='mt-2 text-muted-foreground'>
              Dữ liệu của bạn được lưu trữ trên hệ thống máy chủ bảo mật.
              Chúng tôi chỉ lưu giữ thông tin trong thời gian cần thiết để
              thực hiện các mục đích được nêu trong chính sách này.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>6. Quyền của người dùng</h2>
            <p className='mt-2 text-muted-foreground'>Bạn có quyền:</p>
            <ul className='mt-2 list-inside list-disc space-y-1 text-muted-foreground'>
              <li>Truy cập và xem thông tin cá nhân của mình</li>
              <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
              <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
              <li>Rút lại sự đồng ý cho việc xử lý dữ liệu</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>7. Liên hệ</h2>
            <p className='mt-2 text-muted-foreground'>
              Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ qua
              email{' '}
              <a
                href='mailto:support@basepharmacy.vn'
                className='text-primary underline'
              >
                support@basepharmacy.vn
              </a>
            </p>
          </section>
        </div>

        <div className='mt-12 border-t pt-6'>
          <Link to='/' className='text-sm text-primary underline'>
            &larr; Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
