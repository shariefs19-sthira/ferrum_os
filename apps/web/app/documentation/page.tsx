'use client';

import Link from 'next/link';

export default function DocumentationPage() {
  return (
    <div>
      <h1>Documentation Hub</h1>
      <ul>
        <li><Link href="/resources/is-code-guides">IS-Code Guides</Link></li>
        <li><Link href="/resources/blog">Blog</Link></li>
        <li><Link href="/resources/case-studies">Case Studies</Link></li>
      </ul>
    </div>
  );
}