import certs from "@/data/certs";
import type { Cert } from "@/data/certs";

const VENDOR_COLORS: Record<Cert["vendor"], string> = {
  CompTIA: "text-red-400",
  Cisco: "text-blue-400",
  AWS: "text-orange-400",
};

const RESOURCE_ICONS: Record<string, string> = {
  video: "▶",
  docs: "📄",
  practice: "✎",
  book: "📖",
};

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Study Resources</h1>
      <p className="text-gray-400 mb-8">All curated resources across your cert roadmap.</p>

      <div className="space-y-10">
        {certs.map((cert) => (
          <section key={cert.id}>
            <h2 className="text-lg font-semibold text-white mb-1">
              <span className={`mr-2 text-sm font-normal ${VENDOR_COLORS[cert.vendor]}`}>
                {cert.vendor}
              </span>
              {cert.name}
            </h2>
            <ul className="space-y-2 mt-3">
              {cert.resources.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
                  >
                    <span className="text-lg">{RESOURCE_ICONS[r.type]}</span>
                    <span className="flex-1 text-sm text-gray-200 group-hover:text-white">
                      {r.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.free ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                      }`}
                    >
                      {r.free ? "Free" : "Paid"}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{r.type}</span>
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
