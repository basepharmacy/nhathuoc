import { Link } from '@tanstack/react-router'

export function LandingHeader() {
  return (
    <header className='sticky top-0 z-50 border-b border-[var(--lp-surface-variant)] bg-[var(--lp-surface)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--lp-surface)]/70'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>
        <a
          href='/'
          className='flex items-center gap-2'
          aria-label='Sổ Nhà Thuốc trang chủ'
        >
          <img
            src='/images/favicon.svg'
            alt='Sổ Nhà Thuốc logo'
            width={40}
            height={40}
            className='rounded-lg'
          />
          <span className='lp-font-heading text-xl font-extrabold tracking-tight'>
            Sổ Nhà Thuốc
          </span>
        </a>
        <nav className='hidden items-center gap-8 text-sm md:flex'>
          <a href='/#features' className='hover:opacity-80'>
            Tính năng
          </a>
          <a href='/#how-it-works' className='hover:opacity-80'>
            Cách hoạt động
          </a>
          <a href='/#pricing' className='hover:opacity-80'>
            Chi phí
          </a>
          <a href='/#migration' className='hover:opacity-80'>
            Miễn phí chuyển đổi
          </a>
          <a href='/#faq' className='hover:opacity-80'>
            Hỏi đáp
          </a>
        </nav>
        <div className='flex items-center gap-3'>
          <Link
            to='/sign-in'
            className='rounded-full border border-[var(--lp-surface-variant)] px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5'
          >
            Đăng nhập
          </Link>
          <a
            href='/#cta'
            className='rounded-full bg-[var(--lp-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--lp-on-primary)] hover:brightness-95'
          >
            Dùng thử miễn phí
          </a>
        </div>
      </div>
    </header>
  )
}
