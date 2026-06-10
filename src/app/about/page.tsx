import type { Metadata } from 'next';
import Link from 'next/link';
import CharacterAvatar from '@/components/CharacterAvatar';
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons';

export const metadata: Metadata = {
  title: 'About — Lion City Bank SQL Analytics Terminal',
  description: 'About SQLwak and its maker, Martin (@martinl5).',
};

const LINKS = [
  {
    label: 'GitHub',
    handle: '@martinl5',
    href: 'https://github.com/martinl5',
    icon: <GitHubIcon size={15} />,
  },
  {
    label: 'LinkedIn',
    handle: 'Martin Lim',
    href: 'https://www.linkedin.com/in/martin-lim-43462322a/',
    icon: <LinkedInIcon size={15} />,
  },
];

export default function AboutPage() {
  // The root layout pins body to overflow:hidden, so this page owns its scroll.
  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: 'var(--lcb-black)' }}>
      {/* ── Brand header ─────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--lcb-gold)', height: 3 }} />
      <div
        className="flex items-center justify-between px-5 py-2"
        style={{ background: 'var(--lcb-panel-2)', borderBottom: '1px solid var(--lcb-border)' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 18 }}>🦁</span>
          <span
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-gold)' }}
          >
            Lion City Bank
          </span>
          <span className="text-xs" style={{ color: 'var(--lcb-border)' }}>|</span>
          <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--lcb-muted)' }}>
            About
          </span>
        </div>
        <Link
          href="/"
          className="text-xs tracking-widest uppercase hover:underline"
          style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-gold)' }}
        >
          ← Back to the terminal
        </Link>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div
          className="flex flex-col items-center text-center px-8 py-10 fade-in-up"
          style={{
            background: 'var(--lcb-panel)',
            border: '1px solid var(--lcb-border)',
            borderTop: '3px solid var(--lcb-gold)',
            borderRadius: 8,
          }}
        >
          <CharacterAvatar size={240} />

          <h1
            className="text-3xl font-bold mt-4"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lcb-gold)' }}
          >
            Martin
          </h1>
          <p
            className="text-xs mt-1 tracking-widest"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-muted)' }}
          >
            @martinl5
          </p>

          <p
            className="text-sm leading-6 mt-5 max-w-md"
            style={{ color: 'var(--lcb-white)', opacity: 0.85 }}
          >
            I built SQLwak to make SQL practice feel like real analyst work instead of homework.
            Every level is a business request at the fictional Lion City Bank — from your first
            SELECT as a Graduate Analyst to window functions on the Maritime Trade Finance desk.
          </p>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-xs transition-colors hover:underline"
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  color: 'var(--lcb-gold)',
                  background: 'rgba(201,168,76,0.07)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 4,
                }}
              >
                {link.icon}
                <span className="font-semibold uppercase tracking-wider">{link.label}</span>
                <span style={{ color: 'var(--lcb-muted)' }}>{link.handle}</span>
              </a>
            ))}
          </div>

          <p
            className="text-xs mt-8 tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-muted)', opacity: 0.7 }}
          >
            Psst — he winks if you hover.
          </p>
        </div>
      </div>
    </div>
  );
}
