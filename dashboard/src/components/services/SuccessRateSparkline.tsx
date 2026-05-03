import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface SuccessRateSparklineProps {
  values: number[];
  /** When true, the line goes danger-tinted (sub-99% bucket present). */
  degraded?: boolean;
  className?: string;
}

/**
 * Tiny inline sparkline for the success-rate column on tiles.
 * No axes, no tooltip, no grid — pure trend signal.
 */
export function SuccessRateSparkline({ values, degraded, className }: SuccessRateSparklineProps) {
  const data = values.map((v, i) => ({ x: i, y: v }));
  const stroke = degraded ? '#dc2626' : '#0a64bc';
  return (
    <div className={cn('h-6 w-20', className)} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          {/* Lock the Y-axis to a tight band so dips actually move the line. */}
          <YAxis hide domain={[0.94, 1]} />
          <Line
            type="monotone"
            dataKey="y"
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
