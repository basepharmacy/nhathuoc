import { LandingHeader } from '../components/header'
import { LandingFooter } from '../components/footer'
import { PricingSection } from '../components/pricing-section'
import '../landing.css'

export function LandingHome() {
  return (
    <div className='landing-page min-h-dvh'>
      <LandingHeader />

      {/* Hero */}
      <section id='top' className='relative overflow-hidden'>
        <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
          <div className='absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-[var(--lp-primary-container)] opacity-30 blur-[100px]' />
          <div className='absolute -top-10 right-0 h-[400px] w-[400px] rounded-full bg-[var(--lp-tertiary-container)] opacity-25 blur-[120px]' />
          <div className='absolute bottom-0 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-[var(--lp-secondary-container)] opacity-20 blur-[100px]' />
        </div>
        <div className='relative mx-auto max-w-7xl px-6 pt-8 pb-16 md:pt-14 md:pb-20'>
          <div className='grid items-center gap-12 md:grid-cols-2'>
            <div>
              <div className='mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--lp-primary-container)] px-4 py-1.5 text-xs font-semibold text-[var(--lp-on-primary-container)]'>
                <span>Dành riêng cho nhà thuốc hộ kinh doanh tại Việt Nam</span>
              </div>
              <h1 className='lp-font-heading text-3xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl'>
                Quản lý nhà thuốc <br className='hidden md:block' />
                <span className='text-[var(--lp-primary)]'>
                  Bán hàng chỉ 5 giây
                </span>
              </h1>
              <p className='mt-6 text-base text-[var(--lp-on-surface-variant)] md:text-lg'>
                Bạn chỉ Nhập hàng, Tồn kho, Bán hàng — Doanh thu, lợi nhuận,
                nhắc nhở hết hàng, hết hạn để chúng tôi lo.
                <br />
                Không cần đào tạo, không cần chuyên gia công nghệ. Nhìn là biết
                dùng.
              </p>
              <div className='mt-8 flex flex-col gap-4 sm:flex-row'>
                <a
                  href='#cta'
                  className='rounded-full bg-[var(--lp-primary)] px-8 py-3.5 text-sm font-semibold text-[var(--lp-on-primary)] hover:brightness-95'
                >
                  Bắt đầu miễn phí
                </a>
                <a
                  href='#features'
                  className='rounded-full border border-[var(--lp-surface-variant)] px-8 py-3.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5'
                >
                  Khám phá tính năng
                </a>
              </div>
              <div className='mt-10 flex flex-wrap gap-6 text-sm text-[var(--lp-on-surface-variant)]'>
                <div className='flex items-center gap-2'>
                  <svg className='h-5 w-5 text-[var(--lp-primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}><path strokeLinecap='round' strokeLinejoin='round' d='M13 10V3L4 14h7v7l9-11h-7z' /></svg>
                  Bán hàng đầu tiên trong 5 phút
                </div>
                <div className='flex items-center gap-2'>
                  <svg className='h-5 w-5 text-[var(--lp-primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}><path strokeLinecap='round' strokeLinejoin='round' d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' /></svg>
                  Báo cáo hàng ngày qua điện thoại
                </div>
                <div className='flex items-center gap-2'>
                  <svg className='h-5 w-5 text-[var(--lp-primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}><path strokeLinecap='round' strokeLinejoin='round' d='M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072' /><line x1='1' y1='1' x2='23' y2='23' strokeLinecap='round' /></svg>
                  Dùng được ngay cả khi mất mạng
                </div>
                <div className='flex items-center gap-2'>
                  <svg className='h-5 w-5 text-[var(--lp-primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}><path strokeLinecap='round' strokeLinejoin='round' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>
                  Báo cáo thuế chỉ với 1 lần bấm
                </div>
              </div>
            </div>
            <div className='flex justify-center md:justify-end'>
              <img
                src='/landing/assets/hero-image.svg'
                alt='Minh họa quầy nhà thuốc'
                width={560}
                height={460}
                className='h-auto w-full max-w-[560px]'
              />
            </div>
          </div>
        </div>
        <div className='lp-dotted-divider h-8 md:h-10' />
      </section>

      {/* Pain Points */}
      <section className='py-12 md:py-16'>
        <div className='mx-auto max-w-7xl px-6'>
          <h2 className='lp-font-heading text-center text-2xl font-extrabold md:text-3xl'>
            Nhà thuốc của bạn đang gặp vấn đề này?
          </h2>
          <div className='mt-10 grid gap-6 md:grid-cols-3'>
            {[
              {
                icon: <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>,
                title: 'Bán nhiều mà không cảm thấy có lãi',
                desc: 'Tối mất 30 phút ghi chép, đối chiếu doanh thu và tính lãi bằng tay, tự nhiên hình như thấy thiếu thiếu.',
              },
              {
                icon: <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z' /></svg>,
                title: 'Hết hàng, hết hạn mà không biết',
                desc: 'Thuốc bán chạy hết mà quên chưa đặt hàng. Thuốc sắp hết hạn mà không biết để đẩy hàng',
              },
              {
                icon: <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>,
                title: 'Phần mềm phức tạp, rối rắm',
                desc: 'Quá nhiều tính năng không cần thiết, phí cao, thao tác chậm, dùng bực mình, giảm hiệu quả bán hàng.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className='rounded-2xl border border-[var(--lp-surface-variant)] bg-white/70 p-6 backdrop-blur dark:bg-white/5'
              >
                <div className='text-[var(--lp-secondary)]'>{item.icon}</div>
                <h3 className='lp-font-heading mt-4 text-lg font-bold'>
                  {item.title}
                </h3>
                <p className='mt-2 text-sm text-[var(--lp-on-surface-variant)]'>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className='lp-dotted-divider mt-12 h-8 md:h-10' />
      </section>

      {/* Features */}
      <section id='features' className='py-12 md:py-16'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='lp-font-heading text-2xl font-extrabold md:text-3xl'>
              Mọi thứ nhà thuốc hộ kinh doanh cần, không thừa không thiếu
            </h2>
            <p className='mx-auto mt-3 max-w-2xl text-[var(--lp-on-surface-variant)]'>
              Tập trung vào nhập hàng, tồn kho, bán hàng - còn lại để phần mềm
              lo.
            </p>
          </div>
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                icon: <svg className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z' /></svg>,
                title: 'Bán hàng nhanh chóng',
                desc: 'Tìm thuốc siêu nhanh bằng tên hoặc scan barcode. Thao tác nhanh bằng bàn phím. Chọn thuốc, chỉnh số lượng, thanh toán, in hóa đơn — tất cả trong vài giây.',
                tag: 'Phản hồi cực nhanh',
              },
              {
                icon: <svg className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z' /></svg>,
                title: 'Quản lý tồn kho',
                desc: 'Theo dõi tồn kho theo lô hàng và hạn sử dụng. Cảnh báo hàng sắp hết, hàng sắp hết hạn. Chẳng phải ghi nhớ nữa',
                tag: 'Theo lô & hạn sử dụng',
              },
              {
                icon: <svg className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' /></svg>,
                title: 'Báo cáo rõ ràng, dễ hiểu',
                desc: 'Nhìn là biết doanh thu, lợi nhuận, tiền thất thoát (do hàng hết hạn, mất mát) theo ngày/tuần/tháng, sản phẩm bán chạy nhất',
                tag: 'Lãi lỗ rõ ràng',
              },
              {
                icon: <svg className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' /></svg>,
                title: 'Quản lý khách hàng',
                desc: 'Lưu thông tin khách hàng thân thiết, tra cứu theo tên hoặc SĐT, xem lịch sử mua hàng để chăm sóc tốt hơn.',
                tag: 'Lịch sử mua hàng',
              },
              {
                icon: <svg className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' /></svg>,
                title: 'Nhà cung cấp & Nhập hàng',
                desc: 'Quản lý danh sách nhà cung cấp, tạo đơn đặt hàng và xác nhận nhập kho. Tồn kho tự động cập nhật theo lô.',
                tag: 'Đặt hàng & nhập kho',
              },
              {
                icon: <svg className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z' /><path strokeLinecap='round' strokeLinejoin='round' d='M6 6h.008v.008H6V6z' /></svg>,
                title: 'Hỗ trợ báo cáo thuế',
                desc: 'Báo cáo doanh thu, lợi nhuận, hàng tồn kho theo định dạng chuẩn để khai báo thuế dễ dàng. 1 nút bấm để in ra giấy để nộp cho cơ quan thuế.',
                tag: 'Chỉ 1 click báo cáo thuế',
              },
            ].map((f) => (
              <div
                key={f.title}
                className='rounded-2xl border border-[var(--lp-surface-variant)] bg-white/70 p-6 backdrop-blur transition-transform hover:translate-y-[-2px] dark:bg-white/5'
              >
                <div className='flex items-start justify-between'>
                  <div className='text-[var(--lp-primary)]'>{f.icon}</div>
                  <span className='rounded-full bg-[var(--lp-primary-container)] px-2.5 py-1 text-[10px] font-semibold text-[var(--lp-on-primary-container)]'>
                    {f.tag}
                  </span>
                </div>
                <h3 className='lp-font-heading mt-4 text-lg font-bold'>
                  {f.title}
                </h3>
                <p className='mt-2 text-sm text-[var(--lp-on-surface-variant)]'>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className='lp-dotted-divider mt-12 h-8 md:h-10' />
      </section>

      {/* How it works */}
      <section id='how-it-works' className='py-12 md:py-16'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='lp-font-heading text-2xl font-extrabold md:text-3xl'>
              Bắt đầu trong vài phút, không cần chuyên gia
            </h2>
            <p className='mx-auto mt-3 max-w-2xl text-[var(--lp-on-surface-variant)]'>
              Từ lúc đăng ký đến bán hàng đầu tiên — chưa đến 5 phút.
            </p>
          </div>
          <div className='grid gap-8 md:grid-cols-3'>
            {[
              {
                step: '01',
                title: 'Nhập sản phẩm',
                desc: 'Chọn thuốc từ thư viện hơn 50.000 sản phẩm có sẵn với đầy đủ thông tin chuẩn (tên, đơn vị tính, barcode, hoạt chất ...). Hoặc tạo thuốc mới cực nhanh nếu nhà thuốc bạn có thuốc đặc thù.',
              },
              {
                step: '02',
                title: 'Nhập tồn kho ban đầu',
                desc: 'Điền số lượng tồn hiện tại cho từng sản phẩm. Thao tác nhanh kiểu bảng, nhảy ô bằng Tab.',
              },
              {
                step: '03',
                title: 'Bán hàng ngay',
                desc: 'Tìm sản phẩm, chỉnh số lượng, thanh toán, in hóa đơn. Tồn kho tự động cập nhật.',
              },
            ].map((s) => (
              <div key={s.step} className='relative'>
                <span className='lp-font-heading text-6xl font-extrabold text-[var(--lp-primary)] opacity-20'>
                  {s.step}
                </span>
                <h3 className='lp-font-heading mt-2 text-lg font-bold'>
                  {s.title}
                </h3>
                <p className='mt-2 text-sm text-[var(--lp-on-surface-variant)]'>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className='lp-dotted-divider mt-12 h-8 md:h-10' />
      </section>

      {/* Why us */}
      <section id='why-us' className='py-12 md:py-16'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='lp-font-heading text-2xl font-extrabold md:text-3xl'>
              Tại sao chọn Sổ Nhà Thuốc?
            </h2>
          </div>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {[
              {
                title: 'Dành riêng hộ kinh doanh',
                desc: 'Không tính năng phức tạp, không báo cáo tài chính kế toán rườm rà, không phân quyền phức tạp.',
              },
              {
                title: 'Nhìn là biết dùng',
                desc: 'Mọi thao tác ≤ 5 bước. Không cần đào tạo, không cần hướng dẫn sử dụng dài dòng.',
              },
              {
                title: 'Theo dõi lô & hạn sử dụng',
                desc: 'Cảnh báo thuốc sắp hết hạn trước 7 ngày / 1 tháng / 3 tháng. Tự động xuất lô gần hết hạn trước (FEFO).',
              },
              {
                title: 'Cực Nhanh & ổn định',
                desc: 'Mọi thao tác phản hồi siêu nhanh. Nhà thuốc mở cả ngày, hệ thống cũng vậy, ngay cả khi mất mạng',
              },
            ].map((v) => (
              <div
                key={v.title}
                className='rounded-2xl border border-[var(--lp-surface-variant)] bg-white/70 p-6 backdrop-blur dark:bg-white/5'
              >
                <h3 className='lp-font-heading text-lg font-bold leading-snug'>
                  {v.title}
                </h3>
                <p className='mt-2 text-sm text-[var(--lp-on-surface-variant)]'>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className='lp-dotted-divider mt-12 h-8 md:h-10' />
      </section>

      {/* Migration */}
      <section id='migration' className='py-12 md:py-16'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='mb-12 text-center'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--lp-tertiary-container)] px-4 py-1.5 text-xs font-semibold text-[var(--lp-on-tertiary-container)]'>
              <span>Miễn phí 100%</span>
            </div>
            <h2 className='lp-font-heading text-2xl font-extrabold md:text-3xl'>
              Bạn đang dùng hệ thống khác - Miễn phí chuyển đổi 100%!
            </h2>
            <p className='mx-auto mt-3 max-w-2xl text-[var(--lp-on-surface-variant)]'>
              Lo lắng phải nhập lại dữ liệu khi chuyển sang phần mềm mới? Đừng
              lo dữ liệu của bạn sẽ được chuyển sang Sổ Nhà Thuốc y nguyên, chỉ
              5 phút. Hoàn toàn miễn phí.
            </p>
          </div>
          <div className='mx-auto grid max-w-5xl gap-6 md:grid-cols-3'>
            {[
              {
                name: 'WebNhaThuoc',
                desc: 'Hỗ trợ chuyển đổi trọn bộ dữ liệu từ WebNhaThuoc sang Sổ Nhà Thuốc chỉ trong vài phút.',
                icon: '/landing/assets/others/webnhathuoc-logo.svg',
              },
              {
                name: 'KiotViet',
                desc: 'Xuất file từ KiotViet, import vào Sổ Nhà Thuốc — danh mục thuốc, tồn kho, khách hàng được giữ nguyên.',
                icon: '/landing/assets/others/kiotviet-logo.svg',
              },
              {
                name: 'Hệ thống khác',
                desc: 'Bạn đang dùng hệ thống khác? Liên hệ chúng tôi — chúng tôi sẽ hỗ trợ chuyển đổi miễn phí.',
                icon: '',
              },
            ].map((item) => (
              <div
                key={item.name}
                className='flex items-start gap-4 rounded-2xl border border-[var(--lp-surface-variant)] bg-white/70 p-6 backdrop-blur dark:bg-white/5'
              >
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--lp-primary-container)] text-[var(--lp-on-primary-container)]'>
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.name}
                      className='h-10 w-10 object-contain'
                    />
                  ) : (
                    <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' /></svg>
                  )}
                </div>
                <div>
                  <h3 className='lp-font-heading text-lg font-bold'>
                    {item.name}
                  </h3>
                  <p className='mt-1 text-sm text-[var(--lp-on-surface-variant)]'>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='lp-dotted-divider mt-12 h-8 md:h-10' />
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA strip */}
      <section id='cta' className='py-10'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='rounded-3xl bg-[var(--lp-primary)] px-6 py-8 text-center text-[var(--lp-on-primary)] md:px-10 md:py-12'>
            <h3 className='lp-font-heading text-2xl font-extrabold md:text-3xl'>
              Sẵn sàng số hóa nhà thuốc của bạn?
            </h3>
            <p className='mx-auto mt-2 max-w-xl opacity-90'>
              Dùng thử miễn phí. Tự vận hành từ ngày đầu tiên. Bán hàng đầu
              tiên trong 5 phút.
            </p>
            <div className='mt-6 flex flex-col justify-center gap-4 sm:flex-row'>
              <a
                href='/trial'
                className='rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[var(--lp-primary)] hover:opacity-90'
              >
                Đăng ký dùng thử miễn phí
              </a>
              <a
                href='/support'
                className='rounded-full border border-white/40 px-8 py-3.5 text-sm font-semibold hover:bg-white/10'
              >
                Liên hệ tư vấn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id='faq' className='py-12 md:py-16'>
        <div className='mx-auto max-w-4xl px-6'>
          <h2 className='lp-font-heading text-2xl font-extrabold md:text-3xl'>
            Câu hỏi thường gặp
          </h2>
          <div className='mt-6 divide-y divide-[var(--lp-surface-variant)]'>
            {[
              {
                q: 'Sổ Nhà Thuốc có miễn phí không?',
                a: 'Bạn có thể dùng thử miễn phí để trải nghiệm đầy đủ tính năng. Sau đó chúng tôi sẽ có gói cước tháng/năm phù hợp cho nhà thuốc nhỏ.',
              },
              {
                q: 'Tôi không giỏi công nghệ, có dùng được không?',
                a: 'Hoàn toàn được! Sổ Nhà Thuốc được thiết kế theo nguyên tắc "nhìn là biết dùng". Hơn 90% người dùng mới hoàn thành giao dịch bán hàng đầu tiên trong 15 phút mà không cần hướng dẫn.',
              },
              {
                q: 'Phần mềm có hỗ trợ máy in hóa đơn và máy scan barcode không?',
                a: 'Có. Hỗ trợ máy in nhiệt (thermal printer) 58mm và 80mm qua USB/mạng. Máy scan barcode hoạt động như bàn phím — cắm vào là dùng được, không cần cài thêm phần mềm.',
              },
              {
                q: 'Dữ liệu nhà thuốc của tôi có an toàn không?',
                a: 'Dữ liệu mỗi nhà thuốc hoàn toàn tách biệt, mã hóa truyền tải qua HTTPS, và không chia sẻ với bất kỳ bên thứ ba nào.',
              },
              {
                q: 'Có hỗ trợ đơn vị tính dạng Hộp - Vỉ - Viên không?',
                a: 'Có. Mỗi sản phẩm hỗ trợ tối thiểu 3 cấp đơn vị với tỉ lệ quy đổi và giá bán riêng cho từng đơn vị. Ví dụ: 1 Hộp = 5 Vỉ = 100 Viên.',
              },
              {
                q: 'Phần mềm chạy trên trình duyệt nào?',
                a: 'Hỗ trợ chính thức Chrome và Edge phiên bản mới nhất trên máy tính. Bạn không cần cài đặt phần mềm — chỉ cần mở trình duyệt và đăng nhập.',
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
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
