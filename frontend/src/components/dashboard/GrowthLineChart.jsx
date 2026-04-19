import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function GrowthLineChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="glass-panel flex h-[320px] items-center justify-center rounded-[24px]">
        <p className="text-sm text-text-muted">No question trend yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[24px] p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Question Velocity</h3>
        <p className="text-sm text-text-muted">Questions asked over the last 14 days</p>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(107, 114, 128, 0.2)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "16px"
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#7C3AED"
              strokeWidth={3}
              dot={{ fill: "#8B5CF6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
