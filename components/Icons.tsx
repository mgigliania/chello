import type { SVGProps } from "react";

/** One line-drawn set, so every glyph shares a weight and corner radius.
 *  Filled UI glyphs (mic, tabs) are declared separately below. */

type Props = SVGProps<SVGSVGElement> & { size?: number };

function Line({ size = 24, children, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

function Solid({ size = 24, children, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ThemeIcons: Record<string, (props: Props) => React.ReactElement> = {
  cup: (p) => (
    <Line {...p}>
      <path d="M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M3 21h14" />
    </Line>
  ),
  sunrise: (p) => (
    <Line {...p}>
      <path d="M3 18h18" />
      <path d="M7 18a5 5 0 0 1 10 0" />
      <path d="M12 5v2M5.6 8.6l1.4 1.4M18.4 8.6 17 10" />
    </Line>
  ),
  tree: (p) => (
    <Line {...p}>
      <path d="M12 3c3.3 0 6 2.5 6 5.6 0 1.5-.7 2.9-1.7 3.9 1.2.7 2 1.9 2 3.3 0 2.2-2 4-4.4 4H10c-2.4 0-4.4-1.8-4.4-4 0-1.4.8-2.6 2-3.3A5.4 5.4 0 0 1 6 8.6C6 5.5 8.7 3 12 3Z" />
      <path d="M12 14v7" />
    </Line>
  ),
  cutlery: (p) => (
    <Line {...p}>
      <path d="M6 3v6a2 2 0 0 0 4 0V3M8 9v12" />
      <path d="M16 21V3c2 .6 3 2.6 3 5.5S18 13 16 13" />
    </Line>
  ),
  wave: (p) => (
    <Line {...p}>
      <path d="M9 12V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M12 10.5V4.8a1.5 1.5 0 0 1 3 0V11" />
      <path d="M15 11V6.8a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7 7 7 0 0 1-7-7v-2a1.5 1.5 0 0 1 3 0" />
    </Line>
  ),
  basket: (p) => (
    <Line {...p}>
      <path d="M3 9h18l-1.7 9.3A2 2 0 0 1 17.3 20H6.7a2 2 0 0 1-2-1.7L3 9Z" />
      <path d="m8 9 2-5M16 9l-2-5M9.5 13v3M14.5 13v3" />
    </Line>
  ),
  tram: (p) => (
    <Line {...p}>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14M9 20l-2 2M15 20l2 2M9 14h.01M15 14h.01M12 3V1" />
    </Line>
  ),
  house: (p) => (
    <Line {...p}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
      <path d="M10 20v-5h4v5" />
    </Line>
  ),
  people: (p) => (
    <Line {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3.2 3.2 0 0 1 0 6M17 14.4a6 6 0 0 1 4 5.6" />
    </Line>
  ),
  briefcase: (p) => (
    <Line {...p}>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18" />
    </Line>
  ),
  rain: (p) => (
    <Line {...p}>
      <path d="M7 15a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.4 1.6A3.5 3.5 0 0 1 17.5 15H7Z" />
      <path d="M8.5 18.5 7.5 21M12.5 18.5 11.5 21M16.5 18.5 15.5 21" />
    </Line>
  ),
  mountain: (p) => (
    <Line {...p}>
      <path d="m2 19 6.5-11L13 15l2.5-4L22 19H2Z" />
      <circle cx="17" cy="6" r="2" />
    </Line>
  ),
  music: (p) => (
    <Line {...p}>
      <path d="M9 18V6l11-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </Line>
  ),
  film: (p) => (
    <Line {...p}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 9h18M3 15h18M8 4v16M16 4v16" />
    </Line>
  ),
  book: (p) => (
    <Line {...p}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5v-11Z" />
      <path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" />
    </Line>
  ),
  pencil: (p) => (
    <Line {...p}>
      <path d="M15.5 4.5 19.5 8.5 8.5 19.5 4 21l1.5-4.5 10-12Z" />
      <path d="m14 6 4 4" />
    </Line>
  ),
  sparkles: (p) => (
    <Line {...p}>
      <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9 12 3.5Z" />
      <path d="M18.5 16.5 19.3 19l2.2.8-2.2.7-.8 2.5-.8-2.5-2.2-.7 2.2-.8.8-2.5Z" />
    </Line>
  ),
  globe: (p) => (
    <Line {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </Line>
  ),
  glass: (p) => (
    <Line {...p}>
      <path d="M6 3h12l-1 5a5 5 0 0 1-10 0L6 3Z" />
      <path d="M12 13v7M8.5 20h7" />
    </Line>
  ),
  buildings: (p) => (
    <Line {...p}>
      <path d="M3 21V8l6-3v16" />
      <path d="M9 21V11l6-2v12M15 21V13l6-2v10M3 21h18" />
      <path d="M6 11h.01M6 15h.01M12 14h.01M18 16h.01" />
    </Line>
  ),
  flag: (p) => (
    <Line {...p}>
      <path d="M5 21V4" />
      <path d="M5 5h10.5l-1.5 3.5L15.5 12H5" />
    </Line>
  ),
  quote: (p) => (
    <Line {...p}>
      <path d="M4 18a8 8 0 0 1 8-8" />
      <path d="M4 20V9a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v4a5 5 0 0 1-5 5H8l-4 2Z" />
    </Line>
  ),
  plane: (p) => (
    <Line {...p}>
      <path d="M21 3 10.5 14.5M21 3l-6.5 18-4-8-8-4L21 3Z" />
    </Line>
  ),
  heart: (p) => (
    <Line {...p}>
      <path d="M12 20s-7.5-4.4-7.5-9.4A4.6 4.6 0 0 1 12 7.6a4.6 4.6 0 0 1 7.5 3C19.5 15.6 12 20 12 20Z" />
    </Line>
  ),
};

export const MicIcon = (p: Props) => (
  <Solid {...p}>
    <rect x="9" y="2.5" width="6" height="11" rx="3" />
    <path d="M5.5 11a.9.9 0 0 1 1.8 0 4.7 4.7 0 0 0 9.4 0 .9.9 0 0 1 1.8 0 6.5 6.5 0 0 1-5.6 6.4V20h2.6a.9.9 0 0 1 0 1.8H8.5a.9.9 0 0 1 0-1.8h2.6v-2.6A6.5 6.5 0 0 1 5.5 11Z" />
  </Solid>
);

export const MicOffIcon = (p: Props) => (
  <Line {...p} strokeWidth={1.8}>
    <path d="M9 5a3 3 0 0 1 6 0v5m-6 1v-1" />
    <path d="M18 11a6 6 0 0 1-1.2 3.6M6 11a6 6 0 0 0 9 5.2M12 18v3" />
    <path d="m3.5 3.5 17 17" />
  </Line>
);

export const MeaningIcon = (p: Props) => (
  <Solid {...p}>
    <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8.6L7 21v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2.5 5.2h11v1.6h-11V9.2Zm0 3.2h7v1.6h-7v-1.6Z" />
  </Solid>
);

export const TranscriptIcon = (p: Props) => (
  <Line {...p} strokeWidth={1.8}>
    <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v9a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4h-.5A1.5 1.5 0 0 1 3 15.5v-10Z" />
  </Line>
);

export const EndIcon = (p: Props) => (
  <Line {...p} strokeWidth={1.8}>
    <path d="M2.5 14.2c5-5.6 14-5.6 19 0l-1.7 2.6a1.8 1.8 0 0 1-2.2.6l-2.5-1.1a1.8 1.8 0 0 1-1-1.9l.2-1.3a11 11 0 0 0-6.6 0l.2 1.3a1.8 1.8 0 0 1-1 1.9l-2.5 1.1a1.8 1.8 0 0 1-2.2-.6L2.5 14.2Z" />
  </Line>
);

export const KeyboardIcon = (p: Props) => (
  <Line {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <path d="M6 9.5h.01M9.5 9.5h.01M13 9.5h.01M16.5 9.5h.01M6 12.5h.01M9.5 12.5h.01M13 12.5h.01M16.5 12.5h.01M8 15.5h8" />
  </Line>
);

export const SearchIcon = (p: Props) => (
  <Line {...p} strokeWidth={1.9}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Line>
);

export const SlidersIcon = (p: Props) => (
  <Line {...p} strokeWidth={1.9}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2.1" />
    <circle cx="8" cy="17" r="2.1" />
  </Line>
);

export const WaveformIcon = (p: Props) => (
  <Solid {...p}>
    <rect x="2.5" y="10" width="2" height="4" rx="1" />
    <rect x="6.2" y="7" width="2" height="10" rx="1" />
    <rect x="9.9" y="4" width="2" height="16" rx="1" />
    <rect x="13.6" y="7.5" width="2" height="9" rx="1" />
    <rect x="17.3" y="10" width="2" height="4" rx="1" />
  </Solid>
);

export const GridIcon = (p: Props) => (
  <Solid {...p}>
    <rect x="3" y="3" width="8" height="8" rx="2.4" />
    <rect x="13" y="3" width="8" height="8" rx="2.4" />
    <rect x="3" y="13" width="8" height="8" rx="2.4" />
    <rect x="13" y="13" width="8" height="8" rx="2.4" />
  </Solid>
);

export const BookIcon = (p: Props) => (
  <Solid {...p}>
    <path d="M11 5.6C9.6 4.4 7.6 3.8 5 3.8c-1.1 0-2 .4-2 1.3v12.5c0 .8.7 1.2 1.7 1.2 2.3 0 4.4.5 5.6 1.5.4.3.7.1.7-.3V5.6Zm2 14.4c0 .4.3.6.7.3 1.2-1 3.3-1.5 5.6-1.5 1 0 1.7-.4 1.7-1.2V5.1c0-.9-.9-1.3-2-1.3-2.6 0-4.6.6-6 1.8V20Z" />
  </Solid>
);

export const ArrowIcon = (p: Props) => (
  <Line {...p} strokeWidth={2}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </Line>
);

export const CloseIcon = (p: Props) => (
  <Line {...p} strokeWidth={2}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Line>
);

export const SendIcon = (p: Props) => (
  <Solid {...p}>
    <path d="M3.6 11.1 20 3.2c.8-.4 1.6.4 1.2 1.2l-7.9 16.4c-.4.8-1.6.7-1.8-.2l-1.4-6.1-6.1-1.4c-.9-.2-1-1.4-.2-1.8Z" />
  </Solid>
);

export const SparkIcon = (p: Props) => (
  <Solid {...p}>
    <path d="M12 2.5 13.4 8 19 9.5 13.4 11 12 16.5 10.6 11 5 9.5 10.6 8 12 2.5ZM18.6 15.6l.7 2.3 2.2.7-2.2.7-.7 2.3-.7-2.3-2.2-.7 2.2-.7.7-2.3Z" />
  </Solid>
);
