import { useState } from 'react'
import { LandingHeader } from '../components/header'
import { LandingFooter } from '../components/footer'
import '../landing.css'

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby8DvblTRt0ru9_kS3-y_r4TH8jOT1AxGTmoo8Khze8znNX5ShwCJ3VhlhNGTJ8XLhaIQ/exec'

export function LandingTrial() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [usingOther, setUsingOther] = useState(false)
  const [otherSystem, setOtherSystem] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Vui lòng điền tên và số điện thoại.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          usingOther,
          otherSystem: usingOther ? otherSystem : '',
        }),
      })
      setSubmitted(true)
    } catch {
      setError('Gửi thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='landing-page flex min-h-dvh flex-col'>
      <LandingHeader />

      <main className='flex flex-1 items-center'>
        <div className='mx-auto w-full max-w-7xl px-6 py-12 md:py-20'>
          <div className='grid items-center gap-12 md:grid-cols-2'>
            <div className='hidden justify-center md:flex'>
              <img
                src='/landing/assets/hero-image.svg'
                alt='Minh họa quầy nhà thuốc'
                width={560}
                height={460}
                className='h-auto w-full max-w-[560px]'
              />
            </div>

            <div className='mx-auto w-full max-w-md md:mx-0'>
              <h1 className='lp-font-heading text-2xl font-extrabold tracking-tight md:text-3xl'>
                Đăng ký dùng thử{' '}
                <span className='text-[var(--lp-primary)]'>miễn phí</span>
              </h1>
              <p className='mt-2 text-sm text-[var(--lp-on-surface-variant)]'>
                Bắt đầu bán hàng trong 5 phút. Không cần thẻ tín dụng.
              </p>

              {submitted ? (
                <div className='mt-8 rounded-2xl border border-[var(--lp-primary-container)] bg-[var(--lp-primary-container)]/30 p-6 text-center'>
                  <svg
                    className='mx-auto h-12 w-12 text-[var(--lp-primary)]'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <h2 className='lp-font-heading mt-4 text-xl font-bold'>
                    Đăng ký thành công!
                  </h2>
                  <p className='mt-2 text-sm text-[var(--lp-on-surface-variant)]'>
                    Chúng tôi sẽ liên hệ bạn qua số điện thoại trong vòng 24h.
                  </p>
                </div>
              ) : (
                <form className='mt-8 space-y-5' onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor='name'
                      className='mb-1.5 block text-sm font-medium'
                    >
                      Tên khách hàng
                    </label>
                    <input
                      id='name'
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='Nguyễn Văn A'
                      className='w-full rounded-xl border border-[var(--lp-surface-variant)] bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--lp-primary)] focus:ring-1 focus:ring-[var(--lp-primary)] dark:bg-white/5'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='phone'
                      className='mb-1.5 block text-sm font-medium'
                    >
                      Số điện thoại
                    </label>
                    <input
                      id='phone'
                      type='tel'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder='0912 345 678'
                      className='w-full rounded-xl border border-[var(--lp-surface-variant)] bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--lp-primary)] focus:ring-1 focus:ring-[var(--lp-primary)] dark:bg-white/5'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='address'
                      className='mb-1.5 block text-sm font-medium'
                    >
                      Địa chỉ
                    </label>
                    <input
                      id='address'
                      type='text'
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder='123 Nguyễn Trãi, Quận 1, TP.HCM'
                      className='w-full rounded-xl border border-[var(--lp-surface-variant)] bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--lp-primary)] focus:ring-1 focus:ring-[var(--lp-primary)] dark:bg-white/5'
                    />
                  </div>

                  <div>
                    <div className='flex items-center justify-between'>
                      <label
                        htmlFor='using-other'
                        className='text-sm font-medium'
                      >
                        Bạn có đang sử dụng hệ thống khác?
                      </label>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-[var(--lp-on-surface-variant)]'>
                          {usingOther ? 'Có' : 'Không'}
                        </span>
                        <button
                          id='using-other'
                          type='button'
                          role='switch'
                          aria-checked={usingOther}
                          onClick={() => {
                            setUsingOther(!usingOther)
                            if (usingOther) setOtherSystem('')
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${usingOther ? 'bg-[var(--lp-primary)]' : 'bg-[var(--lp-surface-variant)]'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${usingOther ? 'translate-x-5' : 'translate-x-0'}`}
                          />
                        </button>
                      </div>
                    </div>

                    {usingOther && (
                      <div className='mt-4 space-y-3 rounded-xl border border-[var(--lp-surface-variant)] bg-white/70 p-4 dark:bg-white/5'>
                        <p className='mb-3 text-xs text-[var(--lp-on-surface-variant)]'>
                          Chọn hệ thống bạn đang sử dụng:
                        </p>
                        {[
                          {
                            value: 'kiotviet',
                            label: 'KiotViet',
                            icon: '/landing/assets/others/kiotviet-logo.svg',
                          },
                          {
                            value: 'webnhathuoc',
                            label: 'WebNhaThuoc',
                            icon: '/landing/assets/others/webnhathuoc-logo.svg',
                          },
                        ].map((sys) => (
                          <label
                            key={sys.value}
                            className='flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                          >
                            <input
                              type='radio'
                              name='other-system'
                              value={sys.value}
                              checked={otherSystem === sys.value}
                              onChange={(e) => setOtherSystem(e.target.value)}
                              className='h-4 w-4 accent-[var(--lp-primary)]'
                            />
                            <img
                              src={sys.icon}
                              alt={sys.label}
                              className='h-6 w-auto object-contain'
                            />
                            <span className='text-sm font-medium'>
                              {sys.label}
                            </span>
                          </label>
                        ))}
                        <label className='flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5'>
                          <input
                            type='radio'
                            name='other-system'
                            value='other'
                            checked={otherSystem === 'other'}
                            onChange={(e) => setOtherSystem(e.target.value)}
                            className='h-4 w-4 accent-[var(--lp-primary)]'
                          />
                          <svg
                            className='h-6 w-6 text-[var(--lp-on-surface-variant)]'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'
                            />
                          </svg>
                          <span className='text-sm font-medium'>Khác</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {error}
                    </p>
                  )}

                  <button
                    type='submit'
                    disabled={submitting}
                    className='w-full rounded-full bg-[var(--lp-primary)] px-8 py-3.5 text-sm font-semibold text-[var(--lp-on-primary)] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {submitting ? 'Đang gửi...' : 'Đăng ký dùng thử miễn phí'}
                  </button>

                  <p className='text-center text-xs text-[var(--lp-on-surface-variant)]'>
                    Bằng việc đăng ký, bạn đồng ý với{' '}
                    <a
                      href='/privacy'
                      className='underline hover:text-[var(--lp-primary)]'
                    >
                      Chính sách bảo mật
                    </a>{' '}
                    của chúng tôi.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
