import type { Metadata } from 'next';
import Link from 'next/link';
import { MapContent } from '@/features/competency-graph/presentation/MapContent';

export const metadata: Metadata = {
  title: 'Mapa de competencias',
  description:
    'Las 39 competencias de AI Engineering como grafo de prerrequisitos, con su estado actual.',
};

export default function MapaPage() {
  return (
    <>
      <MapContent view="mapa" />
      <p className="mt-6 text-sm text-muted">
        ¿Prefieres leerlo?{' '}
        <Link href="/mapa/tarjetas" className="text-accent underline underline-offset-4">
          Ver el roadmap en tarjetas
        </Link>
      </p>
    </>
  );
}
