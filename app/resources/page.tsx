import certs from "@/data/certs";
import { VENDOR_TEXT } from "@/lib/theme";

const RESOURCE_ICONS: Record<string, string> = {
  video: "▶",
  docs: "▤",
  practice: "✎",
  book: "❑",
};

export default function ResourcesPage() {
  return (
    <div>
      <p className="eyebrow mb-1.5">SUPPLY DEPOT</p>
      <h1 className="font-display text-2xl text-ink mb-2">STUDY RESOURCES</h1>
      <p className="text-[12px] text-dim uppercase tracking-wide mb-8">
        All curated resources across the cert roadmap.
      </p>

      <div className="space-y-10">
        {certs.map((cert) => (
          <section key={cert.id}>
            <h2 className="font-display text-base text-ink mb-3 flex items-center gap-2">
              <span className={`eyebrow ${VENDOR_TEXT[cert.vendor]}`}>{cert.vendor}</span>
              {cert.name}
            </h2>
            <ul className="space-y-2">
              {cert.resources.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="panel flex items-center gap-3 p-3 hover:border-cyan-dim hover:-translate-y-0.5 transition-all group"
                  >
                    <span className="text-cyan text-base">{RESOURCE_ICONS[r.type]}</span>
                    <span className="flex-1 text-[13px] text-dim group-hover:text-ink transition-colors">
                      {r.title}
                    </span>
                    <span className={`badge ${r.free ? "text-go" : "text-faint"}`}>
                      {r.free ? "Free" : "Paid"}
                    </span>
                    <span className="eyebrow hidden sm:inline">{r.type}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
