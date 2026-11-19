import type { Metadata } from 'next';
import { MapContent } from '@/features/competency-graph/presentation/MapContent';

export const metadata: Metadata = {
  title: 'Mapa de competencias',
  description:
    'Las 39 competencias de AI Engineering y sus prerrequisitos, con el estado de cada una.',
};

export default function MapaPage() {
  return <MapContent />;
}
