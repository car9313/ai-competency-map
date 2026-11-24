/**
 * Talleres con entregable.
 *
 * Un taller es lo que no se aprende leyendo: montar algo y comprobar que funciona. Va
 * separado de las prácticas porque tiene objetivo, requisitos y entregable, y a veces está
 * atado a una herramienta concreta, en cuyo caso lleva la fecha en la que se comprobó su
 * documentación.
 *
 * El primero está escrito contra OpenCode y su formato real de skills, verificado en
 * https://opencode.ai/docs/skills/ el 2026-11-24. Las trampas de la sección «gotchas» no son
 * inventadas: son los errores que produce el propio diseño del formato.
 */
import type { Workshop } from '@/features/content/domain/types';

export const WORKSHOPS: readonly Workshop[] = [
  {
    id: 'opencode-skill-from-scratch',
    competencyId: 'agent-skills',
    title: 'Escribe tu primera skill para OpenCode',
    goal: 'Convertir una tarea que hoy explicas cada vez en una skill que el agente descubre y carga solo cuando hace falta.',
    requirements: [
      'OpenCode instalado y funcionando sobre un repositorio propio.',
      'Un AGENTS.md en ese repositorio con los comandos de build y de test.',
      'Una tarea repetitiva que hoy resuelves explicándola en el chat cada vez.',
    ],
    timebox: '45 minutos',
    steps: [
      'Elige la tarea y escribe en una frase cuándo debe cargarse la skill. Esa frase es la `description`, y es lo que el modelo ve antes de decidir.',
      'Crea `.opencode/skills/<id>/SKILL.md`. El id sale del nombre del directorio, no del campo `name`: en `.opencode/skills/release/SKILL.md` el id es `release` aunque el `name` diga «Git Release».',
      'Escribe el cuerpo con lo que solo hace falta cuando se carga: los pasos, las restricciones y a qué fichero mirar. No repitas los comandos que ya están en AGENTS.md.',
      'Mueve lo determinista a un script dentro de `scripts/` y haz que la skill lo invoque en el momento adecuado. Los ficheros de apoyo no se cargan solos: el cuerpo tiene que decir cuándo leerlos.',
      'Comprueba el anuncio: pide al agente que resuelva la tarea sin mencionar la skill. Si no la usa, revisa que tenga `description` y que el id no esté duplicado en otra fuente.',
      'Fuerza la carga a mano con `@<id>` para ver qué entra en la conversación: el cuerpo sin el frontmatter, el directorio base y una muestra de hasta diez ficheros de apoyo.',
      'Rompe el anuncio a propósito: quita la `description` y observa que la skill deja de ofrecerse al modelo. Vuelve a ponerla.',
    ],
    deliverable:
      'Una skill en `.opencode/skills/` con su script si hace falta, y una nota de una línea que diga en qué caso NO debe usarse.',
    rubric: [
      'El id coincide con el nombre del directorio y es kebab-case en minúsculas.',
      'La descripción dice cuándo usarla, no qué hace por dentro.',
      'El cuerpo no repite los comandos que ya están en AGENTS.md.',
      'Lo determinista vive en un script y la skill indica cuándo ejecutarlo.',
      'Está comprobado que sin descripción la skill no se anuncia al modelo.',
      'Existe una línea escrita con el caso en el que la skill no debe usarse.',
    ],
    gotchas: [
      'El id sale de la ruta, no del frontmatter: buscar por el nombre visible no la encuentra.',
      'Sin descripción no se anuncia. Es la causa más frecuente de «mi skill no aparece».',
      'Los ficheros de apoyo no se cargan automáticamente: se entrega una muestra de hasta diez rutas y el agente los lee si el cuerpo se lo pide.',
      'Dos fuentes con el mismo id: gana la de mayor precedencia, y la global puede quedar tapada por la del proyecto sin que nada avise.',
      'La búsqueda para seis niveles por debajo de la raíz: anidar más es una forma silenciosa de que no se encuentre.',
    ],
    tool: {
      name: 'OpenCode',
      url: 'https://opencode.ai/docs/skills/',
      verifiedAt: '2026-11-24',
    },
  },
];
