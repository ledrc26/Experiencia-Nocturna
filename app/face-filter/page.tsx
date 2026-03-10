'use client';

import dynamic from 'next/dynamic';

const FaceFilterScene = dynamic(() => import('./FaceFilterScene'), {
  ssr: false,
});

export default function FaceFilterPage() {
  return <FaceFilterScene />;
}