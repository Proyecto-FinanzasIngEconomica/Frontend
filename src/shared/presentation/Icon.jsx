export function Icon({ name, size = 20, ...props }) {
  const paths = {
    store: (
      <>
        <path d="M3 9h18l-2-6H5L3 9Z" />
        <path d="M4 12v9h16v-9M9 21v-7h6v7M3 9v1a3 3 0 0 0 4.5 2.6A3 3 0 0 0 12 12a3 3 0 0 0 4.5.6A3 3 0 0 0 21 10V9" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18M10.6 5.1 12 5c6.5 0 10 7 10 7a20 20 0 0 1-3 3.8M6 6.5A22 22 0 0 0 2 12s3.5 7 10 7c1.7 0 3.3-.5 4.6-1.2M10 10a3 3 0 0 0 4 4" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    shield: (
      <>
        <path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 2M12 16h.01" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
