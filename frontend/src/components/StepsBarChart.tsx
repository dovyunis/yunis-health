import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts';

interface Row {
  date: string;
  steps: number;
}

interface Props {
  data: Row[];
  goal: number;
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function StepsBarChart({ data, goal }: Props) {
  const chartData = data.map((d) => ({ ...d, day: formatDay(d.date), met: d.steps >= goal }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 24, right: 10, left: 0, bottom: 0 }}>
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip formatter={(value: number) => [`${value.toLocaleString()} steps`, '']} />
        <ReferenceLine y={goal} stroke="#94a3b8" strokeDasharray="4 4" />
        <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.met ? '#10b981' : '#0f9d8f'} />
          ))}
          <LabelList
            dataKey="met"
            position="top"
            content={(props: any) => {
              const { x, y, value } = props;
              if (!value) return <g />;
              return (
                <text x={x} y={y - 6} textAnchor="middle" fontSize={14}>
                  🏅
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
