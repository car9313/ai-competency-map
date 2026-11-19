import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MapView } from '@/features/competency-graph/presentation/MapView';

export const metadata: Metadata = {
  title: 'Mapa de competencias',
  description:
    'Las 37 competencias de AI Engineering y sus prerrequisitos, con el estado de cada una.',
};

export default function MapaPage() {
  return (
    <Suspense fallback={<p className="text-muted">Cargando mapa…</p>}>
      <MapView />
    </Suspense>
  );
}
