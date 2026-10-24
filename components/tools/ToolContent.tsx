import React from "react";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolContentData {
  title: string;
  intro: string;
  steps?: string[];
  tips?: string[];
  notes?: string[];
  faqs?: ToolFaq[];
  privacy?: string;
  valueProp?: string;
}

export function ToolContent({ data }: { data: ToolContentData }) {
  return (
    <section className="mt-12 max-w-3xl mx-auto space-y-8 text-sm leading-relaxed text-text-secondary">
      {data.valueProp && (
        <p className="text-sm text-text-secondary leading-relaxed">{data.valueProp}</p>
      )}
      <div>
        <h2 className="text-lg font-bold text-text-primary">{data.title}</h2>
        <p className="mt-2 text-text-secondary">{data.intro}</p>
      </div>

      {data.steps && data.steps.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-2">How to use it</h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-text-secondary">
            {data.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {data.tips && data.tips.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-2">Tips</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
            {data.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {data.notes && data.notes.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-2">Good to know</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
            {data.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {data.faqs && data.faqs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-text-primary">Frequently asked questions</h3>
          <div className="divide-y divide-border text-xs">
            {data.faqs.map((f, i) => (
              <div key={i} className="py-3">
                <p className="font-semibold text-text-primary mb-1">{f.q}</p>
                <p className="text-text-secondary leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.privacy && (
        <p className="text-xs text-text-secondary italic">{data.privacy}</p>
      )}
    </section>
  );
}
