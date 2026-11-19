import type { Metadata } from 'next';
import { MapContent } from '@/features/competency-graph/presentation/MapContent';

export const metadata: Metadata = {
  title: 'Roadmap en tarjetas',
  description:
    'Las 39 competencias de AI Engineering agrupadas por área, con su estado y su descripción.',
};

export default function MapaTarjetasPage() {
  return <MapContent view="tarjetas" />;
}
