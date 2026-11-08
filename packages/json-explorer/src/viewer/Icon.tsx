export function Icon({
  name
}: {
  name: 'graph' | 'columns' | 'plus' | 'minus' | 'left' | 'right';
}) {
  const paths = {
    graph: 'M2 9h5v6H2zM17 2h5v6h-5zM17 16h5v6h-5zM7 12c6 0 4-7 10-7M7 12c6 0 4 7 10 7',
    columns: 'M4 3v18M12 3v18M20 3v18',
    plus: 'M5 12h14M12 5v14',
    minus: 'M5 12h14',
    left: 'm15 5-7 7 7 7',
    right: 'm9 5 7 7-7 7'
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
