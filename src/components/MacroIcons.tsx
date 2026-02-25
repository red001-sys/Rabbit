const SteakIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12c0-4 3-7 7-7s7 3 7 7-3 7-7 7-7-3-7-7z" fill="currentColor" opacity="0.2" />
    <path d="M6 11c1-3.5 4-5.5 7-5 3 .5 5 3 4.5 6-.5 3-3 5-6.5 4.5S5 14.5 6 11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 10c.5-.5 2-1 3 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9 13c1 .8 3 .8 4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="14" cy="11" r="0.8" fill="currentColor" />
  </svg>
);

const OilDropIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3C12 3 6 10 6 14.5C6 17.5 8.7 20 12 20C15.3 20 18 17.5 18 14.5C18 10 12 3 12 3Z" fill="currentColor" opacity="0.2" />
    <path d="M12 3C12 3 6 10 6 14.5C6 17.5 8.7 20 12 20C15.3 20 18 17.5 18 14.5C18 10 12 3 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 15C9.5 16.4 10.6 17.5 12 17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const SugarCubesIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="10" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="10" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="8" y="4" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <line x1="5" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    <line x1="15" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
  </svg>
);

export { SteakIcon, OilDropIcon, SugarCubesIcon };
