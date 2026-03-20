import { Link } from '@tanstack/react-router'

export function LandingFooter() {
  return (
    <footer className='border-t border-[var(--lp-surface-variant)]'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-2'>
          <img
            src='/images/favicon.svg'
            alt='Sổ Nhà Thuốc'
            width={24}
            height={24}
            className='rounded'
          />
          <span className='lp-font-heading font-bold'>Sổ Nhà Thuốc</span>
        </div>
        <nav className='flex gap-6 text-sm'>
          <Link to='/' className='hover:opacity-80'>
            Giới thiệu
          </Link>
          <Link to='/privacy' className='hover:opacity-80'>
            Chính sách bảo mật
          </Link>
          <Link to='/support' className='hover:opacity-80'>
            Liên hệ
          </Link>
        </nav>
      </div>
    </footer>
  )
}
