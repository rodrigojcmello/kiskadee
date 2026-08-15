import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Showcase</h1>
      <ul>
        <li>
          <Link href="/colors">/colors</Link>
        </li>
        <li>
          <Link href="/typography">/typography</Link>
        </li>
        <li>
          <Link href="/button">/button</Link>
        </li>
        <li>
          <Link href="/card">/card</Link>
        </li>
        <li>
          <Link href="/dropdown">/dropdown</Link>
        </li>
        <li>
          <Link href="/slider">/slider</Link>
        </li>
        <li>
          <Link href="/select">/select</Link>
        </li>
        <li>
          <Link href="/separator">/separator</Link>
        </li>
        <li>
          <Link href="/tabs">/tabs</Link>
        </li>
        <li>
          <Link href="/switch">/switch</Link>
        </li>
        <li>
          <Link href="/text-field">/text-field</Link>
        </li>
        <li>
          <Link href="/icons">/icons</Link>
        </li>
      </ul>
    </main>
  );
}
