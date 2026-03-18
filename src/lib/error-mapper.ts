/**
 * Central Supabase error → Vietnamese message mapper.
 *
 * Handles PostgreSQL error codes (23505 unique violation, etc.),
 * HTTP status codes, and common Supabase/Auth errors.
 */

const DEFAULT_MESSAGE = 'Đã xảy ra lỗi, vui lòng thử lại.'

// ── Unique-constraint (23505) friendly messages ─────────────────────
// const UNIQUE_CONSTRAINT_MESSAGES: Record<string, string> = {
//   customers_phone_tenant: 'Số điện thoại khách hàng đã tồn tại.',
//   customers_name_tenant: 'Tên khách hàng đã tồn tại.',
//   suppliers_phone_tenant: 'Số điện thoại nhà cung cấp đã tồn tại.',
//   suppliers_name_tenant: 'Tên nhà cung cấp đã tồn tại.',
//   products_barcode_tenant: 'Mã vạch sản phẩm đã tồn tại.',
//   products_product_code_tenant: 'Mã sản phẩm đã tồn tại.',
//   products_product_name_tenant: 'Tên sản phẩm đã tồn tại.',
//   categories_name_tenant: 'Tên danh mục đã tồn tại.',
//   locations_name_tenant: 'Tên cửa hàng đã tồn tại.',
//   sale_orders_sale_order_code_key: 'Mã đơn bán hàng đã tồn tại.',
//   purchase_orders_purchase_order_code_key: 'Mã đơn nhập hàng đã tồn tại.',
// }

// ── PostgreSQL error-code messages ──────────────────────────────────
const PG_ERROR_CODE_MESSAGES: Record<string, string> = {
  '23503': 'Không thể thực hiện vì dữ liệu đang được sử dụng ở nơi khác.',
  '23514': 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại.',
  '42501': 'Bạn không có quyền thực hiện thao tác này.',
  '42P01': 'Lỗi hệ thống, vui lòng liên hệ quản trị viên.',
  PGRST301: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
}

// ── HTTP status-code messages ───────────────────────────────────────
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Yêu cầu không hợp lệ.',
  401: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu.',
  409: 'Dữ liệu bị xung đột, vui lòng tải lại trang.',
  422: 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại.',
  429: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
  500: 'Máy chủ đang bận. Vui lòng thử lại sau.',
  502: 'Máy chủ đang bận. Vui lòng thử lại sau.',
  503: 'Máy chủ đang bận. Vui lòng thử lại sau.',
}

// ── Auth-specific messages ──────────────────────────────────────────
const AUTH_MESSAGE_MAP: Record<string, string> = {
  'Invalid login credentials': 'Email hoặc mật khẩu không đúng.',
  'Email not confirmed': 'Email chưa được xác nhận.',
  'User already registered': 'Tài khoản đã tồn tại.',
  'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự.',
}

const EXCEPTION_MESSAGE_MAP: Record<string, string> = {
  'BATCH_NOT_FOUND': 'Không tìm thấy mã lô hàng.',
  'INSUFFICIENT_STOCK': 'Số lượng tồn không đủ để thực hiện điều chỉnh.',
  'NEGATIVE_QUANTITY_NOT_ALLOWED': 'Số lượng điều chỉnh không được âm.',
  'JWT_MISSING_TENANT_ID': 'Mã khách hàng không hợp lệ hoặc thiếu trong token.',
}

/**
 * Maps a Supabase / PostgreSQL error to a user-friendly Vietnamese message.
 */
export function mapSupabaseError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return DEFAULT_MESSAGE
  }

  const err = error as {
    code?: string
    message?: string
    status?: number
    statusCode?: number
  }

  if (err.message && err.message in EXCEPTION_MESSAGE_MAP) {
    return EXCEPTION_MESSAGE_MAP[err.message]
  }

  // ── 1. Unique violation (23505) ───────────────────────────────
  if (err.code === '23505' && err.message) {
    return 'Dữ liệu đã tồn tại, vui lòng kiểm tra lại.'
  }

  // ── 2. Other PostgreSQL error codes ───────────────────────────
  if (err.code && err.code in PG_ERROR_CODE_MESSAGES) {
    return PG_ERROR_CODE_MESSAGES[err.code]
  }

  // ── 3. Auth error messages ────────────────────────────────────
  if (err.message) {
    for (const [key, msg] of Object.entries(AUTH_MESSAGE_MAP)) {
      if (err.message.includes(key)) return msg
    }
  }

  // ── 4. HTTP status codes ──────────────────────────────────────
  const status = err.status ?? err.statusCode
  if (status && status in HTTP_STATUS_MESSAGES) {
    return HTTP_STATUS_MESSAGES[status]
  }

  return err.message ?? DEFAULT_MESSAGE
}
