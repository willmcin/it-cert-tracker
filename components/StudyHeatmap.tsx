"use client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKS = 52;

const RAMP = ["#152023", "#15403c", "#1f8a82", "#39e0d0", "#7fffb0"];

function cellColor(minutes: number): string {
  if (minutes === 0) return RAMP[0];
  if (minutes < 20) return RAMP[1];
  if (minutes < 45) return RAMP[2];
  if (minutes < 90) return RAMP[3];
  return RAMP[4];
}

function buildGrid(): { date: string; label: string }[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // align to Sunday of the current week
  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() - today.getDay() + 6); // end on Saturday of current week

  const grid: { date: string; label: string }[][] = [];

  for (let w = WEEKS - 1; w >= 0; w--) {
    const week: { date: string; label: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(endSunday);
      day.setDate(endSunday.getDate() - w * 7 - (6 - d));
      const iso = day.toISOString().slice(0, 10);
      const label = `${MONTHS[day.getMonth()]} ${day.getDate()}, ${day.getFullYear()}`;
      week.push({ date: iso, label });
    }
    grid.push(week);
  }

  return grid;
}

function buildMonthLabels(grid: { date: string }[][]): { col: number; label: string }[] {
  const labels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  grid.forEach((week, col) => {
    const month = new Date(week[0].date).getMonth();
    if (month !== lastMonth) {
      labels.push({ col, label: MONTHS[month] });
      lastMonth = month;
    }
  });
  return labels;
}

type Props = {
  data: Record<string, number>; // date -> minutes
};

export default function StudyHeatmap({ data }: Props) {
  const grid = buildGrid();
  const monthLabels = buildMonthLabels(grid);
  const hasAnyData = Object.values(data).some((m) => m > 0);

  if (!hasAnyData) return null;

  return (
    <div className="panel mb-8 px-5 py-4">
      <h2 className="eyebrow mb-3">STUDY ACTIVITY // 52-WEEK TELEMETRY</h2>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 pl-8">
            {monthLabels.map(({ col, label }) => (
              <div
                key={`${col}-${label}`}
                className="text-[10px] text-faint absolute uppercase tracking-wider"
                style={{ marginLeft: `${col * 14}px` }}
              >
                {label}
              </div>
            ))}
            {/* spacer to push month labels into position */}
            <div style={{ width: `${WEEKS * 14}px`, height: "16px", position: "relative" }}>
              {monthLabels.map(({ col, label }) => (
                <span
                  key={`${col}-${label}`}
                  className="text-[10px] text-faint absolute uppercase tracking-wider"
                  style={{ left: `${col * 14}px` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className="text-[10px] text-faint flex items-center"
                  style={{ height: "12px", visibility: i % 2 === 1 ? "visible" : "hidden" }}
                >
                  {d[0]}
                </div>
              ))}
            </div>

            {/* Cells */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map(({ date, label }) => {
                  const mins = data[date] ?? 0;
                  return (
                    <div
                      key={date}
                      title={mins > 0 ? `${label}: ${mins}m studied` : label}
                      className="w-3 h-3 cursor-default"
                      style={{ backgroundColor: cellColor(mins) }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 justify-end">
            <span className="text-[10px] text-faint uppercase tracking-wider">Less</span>
            {RAMP.map((c) => (
              <div key={c} className="w-3 h-3" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[10px] text-faint uppercase tracking-wider">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
