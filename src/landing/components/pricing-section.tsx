import { useState } from 'react'

const plans = [
  {
    name: 'Cơ Bản',
    description: 'Dành cho nhà thuốc nhỏ bắt đầu chuyển đổi, chỉ 1 cửa hàng',
    monthlyPrice: 149000,
    ctaLabel: 'Dùng thử miễn phí',
    ctaHref: '/cta',
    features: [
      'Thực hiện bán hàng',
      'Quản lý lô hàng & hạn sử dụng',
      'Quản lý nhà cung cấp & lịch sử nhập',
      'Quản lý khách hàng & lịch sử mua',
      'Báo cáo doanh thu, lợi nhuận, thất thoát',
      'Cảnh báo tồn kho, hạn sử dụng',
      'Báo cáo thuế cuối kỳ',
      '1 cửa hàng, 1 nhân viên',
    ],
  },
  {
    name: 'Nâng Cao',
    description:
      'Dành cho nhà thuốc muốn quản lý chuyên nghiệp (từ cửa hàng thứ 3 + 99k/tháng)',
    monthlyPrice: 249000,
    popular: true,
    ctaLabel: 'Dùng thử miễn phí',
    ctaHref: '/cta',
    features: [
      'Tất cả tính năng Cơ Bản',
      'Hỗ trợ nhiều chi nhánh',
      'Quản lý nhiều nhân viên',
      'Báo cáo nâng cao, chi tiết',
      'Gợi ý nhập hàng',
      'Báo cáo thuế cho từng cửa hàng',
      'Hỗ trợ ưu tiên',
      '2 cửa hàng, 5 nhân viên',
    ],
  },
  {
    name: 'Chuyên Nghiệp',
    description:
      'Dành cho nhà thuốc quy mô lớn, đầy đủ tính năng (từ cửa hàng thứ 3 + 199k/tháng)',
    monthlyPrice: 499000,
    ctaLabel: 'Liên hệ với chúng tôi',
    ctaHref: '/support',
    features: [
      'Tất cả tính năng Nâng Cao',
      'Có tiên miền riêng',
      'Tuỳ chỉnh hệ thống theo yêu cầu đặc thù',
      'Hỗ trợ trang web riêng cho nhà thuốc',
      'Số lượng cửa hàng & nhân viên theo yêu cầu',
      'Hỗ trợ báo cáo thuế cuối kỳ trọn gói',
      'Chạy khuyến mãi, tích điểm',
      'Hỗ trợ VIP 24/7',
    ],
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price)
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id='pricing' className='py-12 md:py-16'>
      <div className='mx-auto max-w-7xl px-6'>
        <div className='mb-10 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--lp-primary-container)] px-4 py-1.5 text-xs font-semibold text-[var(--lp-on-primary-container)]'>
            <span>Chi phí dịch vụ</span>
          </div>
          <h2 className='lp-font-heading text-2xl font-extrabold md:text-3xl'>
            Chọn gói phù hợp cho nhà thuốc của bạn
          </h2>
          <p className='mx-auto mt-3 max-w-2xl text-[var(--lp-on-surface-variant)]'>
            Miễn phí 3 tháng đầu sử dụng. Miễn phí chuyển đổi 100%. Hủy bất
            cứ lúc nào.
          </p>

          <div className='mt-6 inline-flex items-center rounded-full bg-[var(--lp-surface-variant)] p-1'>
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                !isYearly
                  ? 'bg-[var(--lp-primary)] text-[var(--lp-on-primary)]'
                  : 'text-[var(--lp-on-surface-variant)] hover:text-[var(--lp-foreground)]'
              }`}
            >
              Theo tháng
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                isYearly
                  ? 'bg-[var(--lp-primary)] text-[var(--lp-on-primary)]'
                  : 'text-[var(--lp-on-surface-variant)] hover:text-[var(--lp-foreground)]'
              }`}
            >
              Theo năm
              <span className='ml-1.5 text-[10px] font-bold opacity-80'>
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className='grid items-start gap-6 md:grid-cols-3'>
          {plans.map((plan) => {
            const displayPrice = isYearly
              ? Math.round((plan.monthlyPrice * 0.8) / 1000) * 1000
              : plan.monthlyPrice

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 transition-transform hover:translate-y-[-2px] md:p-8 ${
                  plan.popular
                    ? 'scale-[1.02] border-[var(--lp-primary)] bg-[var(--lp-primary)] text-[var(--lp-on-primary)] md:scale-105'
                    : 'border-[var(--lp-surface-variant)] bg-white/70 backdrop-blur dark:bg-white/5'
                }`}
              >
                {plan.popular && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                    <span className='rounded-full bg-[var(--lp-tertiary)] px-4 py-1 text-xs font-bold text-[var(--lp-on-tertiary)]'>
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                <h3 className='lp-font-heading text-xl font-extrabold'>
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${plan.popular ? 'opacity-80' : 'text-[var(--lp-on-surface-variant)]'}`}
                >
                  {plan.description}
                </p>

                <div className='mt-6 flex items-baseline gap-1'>
                  <span className='lp-font-heading text-4xl font-extrabold'>
                    {formatPrice(displayPrice)}
                    <span className='text-lg'>đ</span>
                  </span>
                  <span
                    className={`text-sm ${plan.popular ? 'opacity-70' : 'text-[var(--lp-on-surface-variant)]'}`}
                  >
                    / tháng
                  </span>
                </div>

                {isYearly && (
                  <p
                    className={`mt-1 text-xs ${plan.popular ? 'opacity-70' : 'text-[var(--lp-on-surface-variant)]'}`}
                  >
                    Thanh toán {formatPrice(displayPrice * 12)}đ / năm
                  </p>
                )}

                <div
                  className={`mt-4 rounded-lg px-3 py-2 text-center text-xs font-semibold ${
                    plan.popular
                      ? 'bg-white/15'
                      : 'bg-[var(--lp-primary-container)] text-[var(--lp-on-primary-container)]'
                  }`}
                >
                  Miễn phí 3 tháng đầu
                </div>

                <ul className='mt-6 space-y-3'>
                  {plan.features.map((feature) => (
                    <li key={feature} className='flex items-start gap-3 text-sm'>
                      <svg
                        className={`mt-0.5 h-5 w-5 shrink-0 ${plan.popular ? 'text-white' : 'text-[var(--lp-primary)]'}`}
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaHref}
                  className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-[var(--lp-primary)] hover:opacity-90'
                      : 'bg-[var(--lp-primary)] text-[var(--lp-on-primary)] hover:brightness-95'
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              </div>
            )
          })}
        </div>
      </div>
      <div className='lp-dotted-divider mt-12 h-8 md:h-10' />
    </section>
  )
}
