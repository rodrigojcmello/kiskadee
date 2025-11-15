import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Showcase</h1>
      <ul>
        <li>
          <Link href="/button">/button</Link>
        </li>
      </ul>
    </main>
  );
}
