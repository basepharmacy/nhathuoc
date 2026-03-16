import { Link } from '@tanstack/react-router'

export function Support() {
  return (
    <div className='min-h-svh bg-background'>
      <div className='mx-auto max-w-3xl px-6 py-16'>
        <h1 className='text-3xl font-bold'>Hỗ trợ</h1>
        <p className='mt-4 text-muted-foreground'>
          Nếu bạn cần hỗ trợ hoặc có bất kỳ câu hỏi nào, vui lòng liên hệ với
          chúng tôi qua các kênh sau:
        </p>

        <div className='mt-8 space-y-6'>
          <section>
            <h2 className='text-xl font-semibold'>Email hỗ trợ</h2>
            <p className='mt-2 text-muted-foreground'>
              Gửi email đến{' '}
              <a
                href='mailto:support@basepharmacy.vn'
                className='text-primary underline'
              >
                support@basepharmacy.vn
              </a>{' '}
              và chúng tôi sẽ phản hồi trong vòng 24 giờ.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>Hotline</h2>
            <p className='mt-2 text-muted-foreground'>
              Gọi đến số{' '}
              <a href='tel:1900000000' className='text-primary underline'>
                1900 000 000
              </a>{' '}
              (Thứ 2 - Thứ 7, 8:00 - 17:00)
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>Câu hỏi thường gặp</h2>
            <div className='mt-4 space-y-4'>
              <div>
                <h3 className='font-medium'>
                  Làm thế nào để tạo đơn hàng mới?
                </h3>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Truy cập mục "Bán hàng" trên thanh điều hướng, chọn sản phẩm
                  và nhấn "Tạo đơn hàng".
                </p>
              </div>
              <div>
                <h3 className='font-medium'>
                  Làm thế nào để quản lý tồn kho?
                </h3>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Vào mục "Kho hàng" để xem số lượng tồn kho, lịch sử nhập
                  xuất và điều chỉnh tồn kho.
                </p>
              </div>
              <div>
                <h3 className='font-medium'>Tôi quên mật khẩu thì phải làm sao?</h3>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Nhấn "Quên mật khẩu" tại trang đăng nhập và làm theo hướng
                  dẫn để đặt lại mật khẩu.
                </p>
              </div>
            </div>
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
