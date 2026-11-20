import { describe, expect, it } from 'vitest';
import { resolveClock } from './dev-clock';

describe('resolveClock', () => {
  it('en desarrollo, ?devtime cambia el día que la app cree que es', () => {
    const clock = resolveClock('?devtime=2026-12-01');

    expect(clock.today()).toBe('2026-12-01');
  });

  it('sin el parámetro usa la hora real', () => {
    const clock = resolveClock('');

    // No se puede afirmar una fecha concreta sin volver la prueba dependiente del calendario;
    // lo que sí se puede afirmar es que respeta el formato.
    expect(clock.today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('ignora un valor que no es una fecha', () => {
    const clock = resolveClock('?devtime=mañana');

    expect(clock.today()).not.toBe('mañana');
  });

  it('no se deja engañar por un parámetro parecido', () => {
    const clock = resolveClock('?devtimex=2026-12-01');

    expect(clock.today()).not.toBe('2026-12-01');
  });

  it('convive con otros parámetros', () => {
    expect(resolveClock('?area=ai-apps-rag&devtime=2027-01-15&capa=nucleo').today()).toBe(
      '2027-01-15',
    );
  });
});
