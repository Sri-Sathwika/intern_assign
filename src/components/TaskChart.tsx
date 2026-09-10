"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  todo: number;
  inProgress: number;
  done: number;
};

export default function TaskChart({
  todo,
  inProgress,
  done,
}: Props) {
  const data = [
    { name: "To Do", value: todo, color: "#8b5cf6" },
    { name: "In Progress", value: inProgress, color: "#3b82f6" },
    { name: "Completed", value: done, color: "#22c55e" },
  ];

  const total = todo + inProgress + done;
  const hasTasks = total > 0;

  return (
    <div className="h-75 w-full">
      {!hasTasks ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-muted">
            <span className="text-sm font-semibold text-muted-foreground">
              0
            </span>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No tasks available yet.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={92}
              paddingAngle={4}
              cornerRadius={6}
              stroke="none"
              label={({ name, value }) =>
                value > 0 ? `${name}: ${value}` : ""
              }
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}
            </Pie>

            {/* Center text */}
            <text
              x="50%"
              y="43%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
            >
              <tspan
                x="50%"
                dy="-2"
                fontSize="28"
                fontWeight="700"
              >
                {total}
              </tspan>

              <tspan
                x="50%"
                dy="22"
                fontSize="12"
                className="fill-muted-foreground"
              >
                Total Tasks
              </tspan>
            </text>

            <Tooltip
              formatter={(value, name) => [
                `${value} task${Number(value) === 1 ? "" : "s"}`,
                name,
              ]}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #ffffff",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}