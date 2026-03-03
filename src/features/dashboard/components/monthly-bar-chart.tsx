import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { formatCurrency, formatShortCurrency } from '@/lib/utils'

type ChartDataItem = {
  name: string
  total: number
}

type BarChartProps = {
  data: ChartDataItem[]
  tooltipLabel?: string
  tooltipLabelFormatter?: (label: string) => string
}

export function MonthlyBarChart({
  data,
  tooltipLabel = 'Giá trị',
  tooltipLabelFormatter = (label) => label,
}: BarChartProps) {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatShortCurrency}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value), { style: 'currency' }), tooltipLabel]}
          labelFormatter={(label) => tooltipLabelFormatter(String(label))}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
