import {
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Settings,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// --- Mock data ---

const healthTrend = [
  { day: 'T2', score: 62 },
  { day: 'T3', score: 58 },
  { day: 'T4', score: 65 },
  { day: 'T5', score: 71 },
  { day: 'T6', score: 68 },
  { day: 'T7', score: 74 },
  { day: 'CN', score: 78 },
]

type InsightTheme = 'issue' | 'opportunity' | 'prediction' | 'trending'

const insightThemeConfig: Record<InsightTheme, { label: string; icon: typeof AlertTriangle; color: string }> = {
  issue: { label: 'Vấn đề', icon: AlertTriangle, color: 'bg-red-600' },
  opportunity: { label: 'Cơ hội', icon: DollarSign, color: 'bg-emerald-600' },
  prediction: { label: 'Dự đoán', icon: Sparkles, color: 'bg-violet-600' },
  trending: { label: 'Trending', icon: TrendingUp, color: 'bg-blue-600' },
}

const insightCards: { title: string; description: string; theme: InsightTheme; cta: string }[] = [
  {
    title: 'Paracetamol 500mg tồn kho cao',
    description: 'Tồn kho 2,400 hộp — gấp 3 lần trung bình bán ra 30 ngày. Cân nhắc giảm nhập hoặc chạy khuyến mãi.',
    theme: 'issue',
    cta: 'Xem tồn kho',
  },
  {
    title: 'Khách mua thuốc ho tăng 45%',
    description: 'Xu hướng mua thuốc ho & cảm cúm tăng mạnh tuần qua, có thể do thời tiết chuyển mùa.',
    theme: 'trending',
    cta: 'Xem chi tiết',
  },
  {
    title: 'Dự đoán hết hàng Vitamin C',
    description: 'Vitamin C 1000mg dự kiến hết hàng trong 3 ngày dựa trên tốc độ bán hiện tại. Nên đặt thêm sớm.',
    theme: 'prediction',
    cta: 'Đặt hàng ngay',
  },
  {
    title: 'Thực phẩm chức năng bán chạy',
    description: 'Nhóm TPCN tăng 32% doanh thu so với tháng trước. Collagen và Omega-3 dẫn đầu danh mục.',
    theme: 'trending',
    cta: 'Xem báo cáo',
  },
  {
    title: 'Cuối tuần dự kiến bận rộn',
    description: 'Dựa trên dữ liệu 4 tuần gần nhất, cuối tuần này dự kiến tăng 25% đơn hàng. Chuẩn bị nhân sự.',
    theme: 'prediction',
    cta: 'Lên lịch',
  },
  {
    title: 'Tăng combo bán kèm kháng sinh',
    description: 'Khách mua kháng sinh thường mua thêm men vi sinh (68%). Gợi ý bán kèm để tăng giá trị đơn.',
    theme: 'opportunity',
    cta: 'Thiết lập combo',
  },
]

const productAlerts = [
  { name: 'Paracetamol 500mg', value: 92 },
  { name: 'Vitamin C 1000mg', value: 78 },
  { name: 'Amoxicillin 500mg', value: 65 },
  { name: 'Thuốc ho Bảo Thanh', value: 54 },
  { name: 'Cao Sao Vàng', value: 41 },
]

const issueDistribution = [
  { name: 'Tồn kho', value: 35 },
  { name: 'Doanh thu', value: 25 },
  { name: 'Vận hành', value: 20 },
  { name: 'Khách hàng', value: 12 },
  { name: 'Khác', value: 8 },
]

const PIE_OPACITIES = [1, 0.8, 0.6, 0.4, 0.25]

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
}

// --- Components ---

function HeroCard() {
  const currentScore = healthTrend[healthTrend.length - 1].score
  const prevScore = healthTrend[healthTrend.length - 2].score
  const change = currentScore - prevScore
  const isUp = change >= 0

  return (
    <Card className='relative overflow-hidden'>
      {/* Info icon - top right */}
      <Popover>
        <PopoverTrigger asChild>
          <button className='absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'>
            <Info className='h-5 w-5' />
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-[360px]' side='bottom' align='end'>
          <p className='font-medium mb-3'>Công thức tính điểm sức khỏe</p>
          <div className='space-y-2 text-sm'>
            <div className='flex items-start gap-2'>
              <span className='shrink-0 font-medium'>30%</span>
              <div>
                <p className='font-medium'>Doanh thu</p>
                <p className='text-xs text-muted-foreground'>So sánh doanh thu thực tế với trung bình 30 ngày gần nhất</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <span className='shrink-0 font-medium'>25%</span>
              <div>
                <p className='font-medium'>Sức khỏe tồn kho</p>
                <p className='text-xs text-muted-foreground'>Tỷ lệ sản phẩm có tồn kho ở mức an toàn (không hết hàng, không tồn quá nhiều)</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <span className='shrink-0 font-medium'>20%</span>
              <div>
                <p className='font-medium'>Khách quay lại</p>
                <p className='text-xs text-muted-foreground'>Tỷ lệ khách mua lặp lại trên tổng số khách trong 30 ngày</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <span className='shrink-0 font-medium'>15%</span>
              <div>
                <p className='font-medium'>Biên lợi nhuận</p>
                <p className='text-xs text-muted-foreground'>Lợi nhuận thực tế so với mục tiêu đặt ra</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <span className='shrink-0 font-medium'>10%</span>
              <div>
                <p className='font-medium'>Vận hành</p>
                <p className='text-xs text-muted-foreground'>Tốc độ xử lý đơn, hàng sắp hết hạn, đơn bất thường</p>
              </div>
            </div>
          </div>
          <p className='mt-3 text-xs text-muted-foreground border-t pt-3'>Mỗi chỉ số được quy về thang 0–100, sau đó tính trung bình có trọng số.</p>
        </PopoverContent>
      </Popover>

      <div className='flex flex-col lg:flex-row'>
        <div className='flex flex-1 flex-col justify-between p-6'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <Badge variant='secondary' className='text-[10px]'>AI</Badge>
              <span className='text-xs text-muted-foreground'>Cập nhật 5 phút trước</span>
            </div>
            <CardTitle className='text-lg mb-1'>Điểm sức khỏe kinh doanh</CardTitle>
            <CardDescription>Đánh giá tổng quan hoạt động nhà thuốc trong tuần</CardDescription>
          </div>

          <div className='mt-4'>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-bold tracking-tight'>{currentScore}</span>
              <span className='text-lg text-muted-foreground font-medium'>/100</span>
            </div>
            <div className='mt-1 flex items-center gap-1.5'>
              {isUp ? (
                <TrendingUp className='h-4 w-4 text-foreground' />
              ) : (
                <TrendingDown className='h-4 w-4 text-foreground' />
              )}
              <span className='text-sm font-medium'>
                {isUp ? '+' : ''}{change} điểm
              </span>
              <span className='text-sm text-muted-foreground'>so với hôm qua</span>
            </div>
          </div>

          <div className='mt-4 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5'>
            <AlertTriangle className='h-4 w-4 shrink-0 text-muted-foreground' />
            <p className='text-sm'>
              <span className='font-medium'>Paracetamol 500mg</span>{' '}
              <span className='text-muted-foreground'>sắp hết hàng — dự kiến hết trong 1.5 ngày</span>
            </p>
            <button className='ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors'>
              Nhập thêm
              <ArrowRight className='h-3 w-3' />
            </button>
          </div>
        </div>

        <div className='flex-1 min-h-[220px] border-t lg:border-t-0 lg:border-l'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={healthTrend} margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
              <defs>
                <linearGradient id='healthGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='hsl(var(--primary))' stopOpacity={0.2} />
                  <stop offset='100%' stopColor='hsl(var(--primary))' stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey='day' stroke='hsl(var(--muted-foreground))' fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[40, 100]} stroke='hsl(var(--muted-foreground))' fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}/100`, 'Điểm']} />
              <Area type='monotone' dataKey='score' stroke='hsl(var(--primary))' strokeWidth={2} fill='url(#healthGradient)' />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

function InsightCard({ title, description, theme, cta }: typeof insightCards[number]) {
  const config = insightThemeConfig[theme]
  const Icon = config.icon

  return (
    <Card className='w-[280px] shrink-0'>
      <CardContent className='flex h-full flex-col gap-2 p-4'>
        <div className='flex items-center gap-2'>
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.color}`}>
            <Icon className='h-3.5 w-3.5 text-white' />
          </div>
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white ${config.color}`}>{config.label}</span>
        </div>
        <p className='text-sm font-medium leading-snug'>{title}</p>
        <p className='text-xs text-muted-foreground leading-relaxed flex-1'>{description}</p>
        <div className='mt-1 flex justify-end'>
          <button className='inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors'>
            {cta}
            <ArrowRight className='h-3 w-3' />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductAlertChart() {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Sản phẩm cần chú ý</CardTitle>
            <CardDescription className='text-xs'>Mức độ ưu tiên xử lý theo AI</CardDescription>
          </div>
          <ShieldCheck className='h-4 w-4 text-muted-foreground' />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={200}>
          <BarChart data={productAlerts} layout='vertical' margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <XAxis type='number' domain={[0, 100]} hide />
            <YAxis type='category' dataKey='name' width={120} stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Mức ưu tiên']} />
            <Bar dataKey='value' fill='hsl(var(--primary))' radius={[0, 4, 4, 0]} maxBarSize={24}>
              {productAlerts.map((_, index) => (
                <Cell key={index} fillOpacity={1 - index * 0.15} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function IssueDistributionChart() {
  const total = issueDistribution.reduce((s, i) => s + i.value, 0)

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Phân loại vấn đề</CardTitle>
            <CardDescription className='text-xs'>Tỷ lệ insight theo danh mục</CardDescription>
          </div>
          <Settings className='h-4 w-4 text-muted-foreground' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-6'>
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={issueDistribution}
                cx='50%'
                cy='50%'
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey='value'
                stroke='hsl(var(--background))'
                strokeWidth={2}
              >
                {issueDistribution.map((_, index) => (
                  <Cell key={index} fill='hsl(var(--foreground))' fillOpacity={PIE_OPACITIES[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
            </PieChart>
          </ResponsiveContainer>
          <div className='flex-1 space-y-2.5'>
            {issueDistribution.map((item, index) => (
              <div key={item.name} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2.5 w-2.5 rounded-full bg-foreground' style={{ opacity: PIE_OPACITIES[index] }} />
                  <span className='text-xs text-muted-foreground'>{item.name}</span>
                </div>
                <span className='text-xs font-medium'>{Math.round((item.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main ---

export function SystemAssistant() {
  return (
    <div className='space-y-4'>
      <HeroCard />

      <div className='-mx-4 px-4 overflow-x-auto'>
        <div className='flex gap-3 pb-2'>
          {insightCards.map((card) => (
            <InsightCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <ProductAlertChart />
        <IssueDistributionChart />
      </div>
    </div>
  )
}
