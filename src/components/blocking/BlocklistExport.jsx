import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Globe, Search, Smartphone } from 'lucide-react';

const BLOCKERS = [
  { name: 'NextDNS', desc: 'Free DNS-level blocker, works on every device', url: 'https://my.nextdns.io' },
  { name: 'Freedom', desc: 'Block sites & apps across phone and computer', url: 'https://freedom.to' },
  { name: 'Cold Turkey', desc: 'Strict desktop website blocker', url: 'https://getcoldturkey.com' },
];

const STEPS = [
  'Copy your list below (domains, keywords, and apps).',
  'Open one of the blockers and paste it as your blocklist.',
  'Turn on its system-wide setting — real blocking, everywhere.',
];

export default function BlocklistExport({ websites = [], keywords = [], apps = [] }) {
  const [copied, setCopied] = useState(false);
  const list = [...websites, ...keywords, ...apps];
  const text = list.join('\n');

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Real device-level blocking</h3>
          <p className="text-xs text-muted-foreground">Export your lists to a blocker that enforces them</p>
        </div>
      </div>

      <ol className="space-y-1.5">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <Button className="w-full gap-2" onClick={handleCopy} disabled={!text}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied to clipboard' : text ? `Copy my list (${list.length} items)` : 'Add items to copy'}
      </Button>

      <div className="space-y-2">
        {BLOCKERS.map(({ name, desc, url }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 bg-secondary/60 hover:bg-secondary rounded-xl px-4 py-3 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                {name} <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <span className="text-xs font-medium text-primary shrink-0">Set up</span>
          </a>
        ))}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        A browser tab can't block other apps — these tools can, at the DNS or device level.
        Your lists here stay synced and ready to paste whenever you update them.
      </p>
    </div>
  );
}