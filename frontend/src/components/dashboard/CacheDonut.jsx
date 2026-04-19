import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#10B981", "#3B82F6"];

export default function CacheDonut({ data = [] }) {
  if (!data.length) {
    return (
      <div className="glass-panel flex h-[320px] items-center justify-center rounded-[24px]">
        <p className="text-sm text-text-muted">No cache activity yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[24px] p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Memory Efficiency</h3>
        <p className="text-sm text-text-muted">Cache hits versus fresh LLM generations</p>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={72}
              outerRadius={100}
              paddingAngle={6}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "16px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm text-text-muted">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}

