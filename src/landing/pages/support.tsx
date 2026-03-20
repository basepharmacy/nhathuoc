import { LandingHeader } from '../components/header'
import { LandingFooter } from '../components/footer'
import '../landing.css'

export function LandingSupport() {
  return (
    <div className='landing-page min-h-dvh'>
      <LandingHeader />
      <main className='mx-auto max-w-2xl px-4 py-8'>
        <h1 className='mb-2 text-3xl font-bold'>Hỗ Trợ</h1>
        <p className='mb-8 text-[var(--lp-on-surface-variant)]'>
          Nếu bạn cần hỗ trợ hoặc có bất kỳ câu hỏi nào, vui lòng liên hệ với
          chúng tôi qua các kênh sau:
        </p>

        <section className='mb-6 rounded-2xl border border-[var(--lp-surface-variant)] bg-white/70 p-6 backdrop-blur dark:bg-white/5'>
          <h2 className='mb-2 text-xl font-semibold'>Email hỗ trợ</h2>
          <p className='text-[var(--lp-on-surface-variant)]'>
            Gửi email đến{' '}
            <a
              href='mailto:support@basepharmacy.vn'
              className='text-[var(--lp-primary)] underline'
            >
              support@basepharmacy.vn
            </a>{' '}
            và chúng tôi sẽ phản hồi trong vòng 24 giờ.
          </p>
        </section>

        <section className='mb-8 rounded-2xl border border-[var(--lp-surface-variant)] bg-white/70 p-6 backdrop-blur dark:bg-white/5'>
          <h2 className='mb-2 text-xl font-semibold'>Hotline</h2>
          <p className='text-[var(--lp-on-surface-variant)]'>
            Gọi đến số{' '}
            <a
              href='tel:1900000000'
              className='font-semibold text-[var(--lp-primary)]'
            >
              1900 000 000
            </a>{' '}
            (Thứ 2 - Thứ 7, 8:00 - 17:00)
          </p>
        </section>

        <h2 className='mb-4 text-2xl font-bold'>Câu hỏi thường gặp</h2>
        <div className='divide-y divide-[var(--lp-surface-variant)]'>
          {[
            {
              q: 'Làm thế nào để tạo đơn hàng mới?',
              a: 'Truy cập mục "Bán hàng" trên thanh điều hướng, chọn sản phẩm và nhấn "Tạo đơn hàng".',
            },
            {
              q: 'Làm thế nào để quản lý tồn kho?',
              a: 'Vào mục "Kho hàng" để xem số lượng tồn kho, lịch sử nhập xuất và điều chỉnh tồn kho.',
            },
            {
              q: 'Tôi quên mật khẩu thì phải làm sao?',
              a: 'Nhấn "Quên mật khẩu" tại trang đăng nhập và làm theo hướng dẫn để đặt lại mật khẩu.',
            },
          ].map((item) => (
            <details key={item.q} className='group py-4'>
              <summary className='flex cursor-pointer list-none items-start justify-between gap-4'>
                <span className='font-semibold leading-6'>{item.q}</span>
                <span
                  className='mt-1 text-[var(--lp-tertiary)] transition-transform group-open:rotate-45'
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className='mt-2 text-[var(--lp-on-surface-variant)]'>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
