<div align="center">

# ATS Resume Builder

**Currículums de ingeniería de software compatibles con ATS, creados, auditados y exportados en local.**

<a href="https://github.com/criblab/ats-resume-builder/actions/workflows/validate.yml"><img src="https://github.com/criblab/ats-resume-builder/actions/workflows/validate.yml/badge.svg" alt="Validate"></a> <a href="https://github.com/criblab/ats-resume-builder/releases/latest"><img src="https://img.shields.io/github/v/release/criblab/ats-resume-builder?label=release" alt="Última versión"></a> <a href="LICENSE"><img src="https://img.shields.io/github/license/criblab/ats-resume-builder" alt="Licencia: MIT"></a> <img src="https://img.shields.io/badge/agentes-Claude%20Code%20%7C%20Codex%20%7C%20Cursor%20%7C%20Copilot%20%7C%20Gemini%20CLI%20%7C%20OpenCode-8A2BE2" alt="Agentes: Claude Code, Codex, Cursor, Copilot, Gemini CLI, OpenCode"> <img src="https://img.shields.io/badge/node-%E2%89%A518-5FA04E?logo=nodedotjs&logoColor=white" alt="Node 18+"> <img src="https://img.shields.io/badge/dependencias-0-brightgreen" alt="Sin dependencias"> <img src="https://img.shields.io/badge/100%25%20local-sin%20subidas-blueviolet" alt="Todo local">

<sub><a href="README.md">English</a> · <b>Español</b></sub>

</div>

Una skill de IA y un kit sin dependencias para crear, adaptar, auditar y exportar **currículums de ingeniería de software compatibles con ATS** desde Markdown.

Combina un flujo de escritura estructurado (fórmula XYZ de Google, palabras clave exactas de la vacante, formato de una sola columna) con scripts locales que generan un HTML/PDF limpio y revisan el resultado antes de postular. Sin cuentas, sin subir datos, sin suscripciones.

<p align="center">
  <img src="docs/preview.png" width="440" alt="Vista previa del currículum de ejemplo">
</p>

<details>
<summary><b>Contenido</b></summary>

- [Por qué existe](#por-qué-existe)
- [Alcance / Qué no es](#alcance--qué-no-es)
- [Qué incluye](#qué-incluye)
- [Inicio rápido](#inicio-rápido)
- [Úsala como skill de IA](#úsala-como-skill-de-ia)
- [Desde cero: qué hace un usuario nuevo](#desde-cero-qué-hace-un-usuario-nuevo)
- [El flujo](#el-flujo)
- [Comandos de exportación](#comandos-de-exportación)
- [Validación](#validación)
- [Personalización](#personalización)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Privacidad](#privacidad)
- [Limitaciones](#limitaciones)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

</details>

## Por qué existe

La mayoría de los consejos de CV oscilan entre superstición de formato y relleno de palabras clave. Este proyecto toma una postura más concreta:

- Los ATS son bases de datos con búsqueda y preguntas eliminatorias, no filtros mágicos que rechazan solos.
- El texto limpio y de una columna se parsea. Las palabras clave exactas y verdaderas hacen que te encuentren. La evidencia hace que te lean.
- Un currículum que miente es peor que uno que puntúa 70.

El flujo está diseñado para que la IA nunca invente métricas, nunca esconda huecos con fechas falsas y nunca cambie la verdad por un puntaje.

## Alcance / Qué no es

**Está hecha para roles de Software Engineer.** El flujo, el banco de keywords, los verbos de acción, los ejemplos y la mayoría de las reglas de validación apuntan a backend, frontend, full-stack, mobile, data, ML, DevOps, SRE, QA y seguridad.

**El motor sirve para casi cualquier profesión.** Markdown -> HTML -> PDF, el formato de una columna, la fórmula XYZ, el modelo de currículum maestro -> variante, la prueba de copiar y pegar y los chequeos estructurales son independientes del campo. Hoy podés usar el exportador y las reglas de formato para un CV de enfermería, derecho, diseño o finanzas.

**La inteligencia del contenido está sesgada a tech.** Si pasás un CV que no es de ingeniería por el validador, esperá:

- un warning de GitHub que no aplica a tu campo;
- menor cobertura de keywords porque el banco no tiene vocabulario clínico, legal, financiero ni de diseño;
- alias de secciones y ejemplos que asumen proyectos y stacks técnicos.

Va a correr igual y va a generar un PDF limpio. Pero no va a ser tan preciso como para ingeniería.

**Qué no es:**

- No garantiza entrevistas ni el "puntaje ATS" de un proveedor específico.
- No es un generador de CV genérico para cualquier industria todavía. No incluye perfiles por campo.
- No es una herramienta de autocompletado de postulaciones ni un coach de carrera.
- No es permiso para inventar métricas, títulos, fechas o credenciales.

Para uso no-tech, tomalo como un kit de formato y exportación, y reemplazá `references/keyword-bank.md` y los ejemplos por los de tu campo. Un sistema de perfiles (`--profile healthcare`, `--profile finance`) es el siguiente paso natural, pero no está implementado.

## Qué incluye

| Archivo | Para qué sirve |
| :--- | :--- |
| `SKILL.md` | El flujo: intake, extracción de la vacante, adaptación, reglas de bullets, validación |
| `templates/resume.md` | Esqueleto en Markdown para completar |
| `templates/resume.css` | Hoja de estilos ATS-safe (Letter o A4) |
| `scripts/build.mjs` | Markdown -> HTML -> PDF usando Chrome/Edge/Chromium instalado |
| `scripts/ats-check.mjs` | Auditoría local: formato, evidencia, fechas, longitud, privacidad, cobertura de keywords |
| `references/` | Verbos de acción, banco de keywords, rúbrica, guía de parsing, casos especiales, cover letter |
| `examples/` | Currículum y vacante ficticios que puntúan 98/100 |

## Inicio rápido

El único requisito es **Node.js 18+**. Nada se descarga ni se sube: sin cuentas, sin API keys, sin instalador.

```bash
git clone https://github.com/criblab/ats-resume-builder.git
cd ats-resume-builder

# Auditar el ejemplo (sin paso de instalación)
npm test

# Generar HTML + PDF
npm run build

# dist/John-Doe-Resume.html
# dist/John-Doe-Resume.pdf
```

## Úsala como skill de IA

Este repo es un paquete **Agent Skills** estándar: una carpeta con `SKILL.md`, `scripts/` y `references/`. El formato es neutral respecto al proveedor, así que la misma copia funciona en cualquier agente que lo implemente.

| Agente | Proyecto | Global |
| :--- | :--- | :--- |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex | `.codex/skills/` | `~/.codex/skills/` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| GitHub Copilot | `.github/skills/` | `~/.copilot/skills/` |
| Gemini CLI | `.gemini/skills/` | `~/.gemini/skills/` |
| OpenCode | `.opencode/skills/` | `~/.config/opencode/skills/` |
| Amp | `.agents/skills/` | `~/.config/agents/skills/` |

El único contrato es `SKILL.md`: frontmatter YAML con `name` y `description`, y luego Markdown. Sin plugin, sin registro, sin adaptador.

### Instalación

Clona una vez en la carpeta global de tu agente, cambiando la ruta según la tabla:

```bash
git clone https://github.com/criblab/ats-resume-builder.git \
  ~/.claude/skills/ats-resume-builder
```

```powershell
# Windows (PowerShell)
git clone https://github.com/criblab/ats-resume-builder.git `
  "$env:USERPROFILE\.claude\skills\ats-resume-builder"
```

Para un solo proyecto, clona dentro de `.claude/skills/`, `.codex/skills/`, `.cursor/skills/`, `.github/skills/`, `.gemini/skills/` o `.opencode/skills/` en el repositorio. Varios agentes también leen `.agents/skills/` (OpenCode, Gemini CLI, Cursor, Amp), así que esa ruta es lo más parecido a una ubicación compartida.

El contenido es Markdown plano, así que también sirve en agentes que aún no implementan el estándar: apunta el agente al archivo (`lee SKILL.md y síguelo`) o pégalo en el archivo de reglas de la herramienta (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules`). Los scripts se comportan igual, porque solo son Node.

### Prompts que la activan

- "Créame un currículum para un puesto senior de backend en Estados Unidos."
- "Adapta mi CV a esta vacante y dime qué falta."
- "Audita este CV para ATS y para bullets débiles."
- "Exporta mi CV a PDF y verifica que el texto se pueda seleccionar."
- "Tengo un hueco de 14 meses. ¿Cómo lo manejo sin mentir?"

La skill pide rol objetivo, mercado, CV y vacante en un solo bloque, y produce un currículum maestro más una variante adaptada, en lugar de sobrescribir un único archivo.

## Desde cero: qué hace un usuario nuevo

Un primer uso típico, de principio a fin:

1. **Encuentra el repo y ve el preview.** Le llama la atención un CV backend de una página y un ejemplo con 98/100.
2. **Lo instala** con un comando de clonado (arriba) y abre su agente de IA en cualquier carpeta.
3. **Pide lo que necesita**, pegando el rol y la vacante:

   > "Tengo 3 años como backend en Colombia y apunto a este rol Senior Backend en EE. UU. Te paso mi CV actual y la vacante. Armá mi currículum maestro, adaptalo y exportá el PDF."

4. **Responde 4-6 preguntas en un solo bloque**: título objetivo, mercado, autorización de trabajo si aplica, métricas faltantes, logros más fuertes y qué no debe incluir.
5. **Recibe dos archivos**: `resume/master.md` (todo lo verdadero y útil) y `resume/variants/acme-senior-backend.md` (la versión adaptada).
6. **Completa los huecos** marcados `[ADD METRIC: ...]` y confirma que cada afirmación se pueda defender en una entrevista.
7. **Corre el validador y la exportación**:

   ```bash
   node scripts/ats-check.mjs resume/variants/acme-senior-backend.md \
     --jd jd.txt --years 3 --output dist/Nombre-Apellido-CV.pdf

   node scripts/build.mjs resume/variants/acme-senior-backend.md \
     --out dist --name Nombre-Apellido-CV
   ```

8. **Hace la prueba de copiar y pegar** sobre el PDF, revisa los links y postula con un CV de una página, una columna y 80%+ de match con la vacante.

¿No usa un agente de IA? Puede hacerlo manual: copia `templates/resume.md`, escribe los bullets y corre los dos comandos. El validador y el exportador funcionan igual.

**Lo que necesita:** Node 18+ y Git. Sin cuenta, API key, suscripción ni subida de datos. El primer uso suele tomar 20-30 minutos, sobre todo pensando métricas, no formato.

## El flujo

```text
Intake -> Inventario maestro -> Brief de la vacante -> Seleccionar evidencia
   -> Reescribir bullets -> Validar (script + prueba manual) -> Exportar MD/HTML/PDF
```

Reglas que aplica la skill:

- Una sola columna, texto seleccionable, encabezados estándar, sin tablas, íconos ni fotos.
- Fechas `Mes Año – Mes Año`, orden cronológico inverso.
- 3-5 bullets para roles recientes; 60%+ con números; todos con un resultado.
- Una página con menos de 5 años de experiencia; máximo dos páginas en el resto.
- Cero métricas inventadas. Los números faltantes quedan como `[ADD METRIC: ...]` hasta confirmarlos.
- 75-85% de cobertura real de las keywords obligatorias, sin relleno.

El detalle completo está en [SKILL.md](SKILL.md) y la rúbrica de 100 puntos en [references/scoring-rubric.md](references/scoring-rubric.md).

## Comandos de exportación

```bash
# HTML + PDF
node scripts/build.mjs resume/master.md --out resume/dist --name Nombre-Apellido-CV

# Solo HTML
node scripts/build.mjs resume/master.md --out resume/dist --no-pdf

# A4 para Europa/LATAM
node scripts/build.mjs resume/master.md --a4

# Diseño más compacto para dos páginas
node scripts/build.mjs resume/master.md --font-size 9.2pt
```

| Flag | Default | Descripción |
| :--- | :--- | :--- |
| `--out <dir>` | `dist` | Carpeta de salida |
| `--name <base>` | nombre del input | Nombre de los archivos |
| `--title <text>` | derivado | Título HTML y metadatos de título del PDF |
| `--font-size <size>` | `9.4pt` | Tamaño del cuerpo (`9.4pt`, `13px`) |
| `--css <file>` | `templates/resume.css` | Hoja de estilos personalizada |
| `--lang <code>` | `en` | Idioma del HTML |
| `--a4` | apagado | A4 en lugar de Letter |
| `--no-pdf` | apagado | Solo HTML |
| `--require-pdf` | apagado | Falla si no puede generar el PDF |

La exportación prueba `CHROME_PATH`, luego Chrome, Edge y Chromium en sus rutas habituales. Usa un perfil temporal, imprime sin encabezados ni pies de página y borra el perfil al terminar. El currículum nunca sale de tu máquina. Si no encuentra un navegador basado en Chromium, el HTML igual se genera: ábrelo e imprime a PDF con márgenes en cero y gráficos de fondo activados.

La hoja de estilos también desactiva las ligaduras `fi`/`fl`/`ff`. Sin eso, al extraer el texto del PDF puede aparecer `notiﬁcación` en lugar de `notificación`, y la búsqueda de keywords pierde el término.

## Validación

```bash
node scripts/ats-check.mjs resume/master.md --jd jd.txt --years 5 --output dist/First-Last-Resume.pdf
```

Resultado con los archivos de ejemplo:

```text
ATS CHECK  examples/master-resume.md
============================================================
Notes
  [i] Keywords: Missing or unmatched: millions, reliability, operate.

Summary
  [ok] 25 checks passed
  [i] 11 experience bullets, 439 words
  [i] Keyword coverage: 96% (95/99 weighted terms)
  Score: 98/100 (A)
```

El script revisa:

- Datos de contacto: nombre, email, teléfono, LinkedIn, GitHub.
- Formato prohibido: tablas, imágenes, HTML embebido, emoji.
- Encabezados de sección y secciones obligatorias.
- Verbos débiles, densidad de métricas, bullets demasiado largos, aperturas repetidas.
- Formato de fechas y rangos con solo año.
- Cantidad de líneas de skills y estimación de páginas.
- Fugas de privacidad: fecha de nacimiento, estado civil, números de identificación.
- Nombre del archivo de salida.
- Cobertura ponderada de keywords de la vacante, con lista de términos sin match.

Códigos de salida: `0` pasa, `1` errores o puntaje bajo `--min-score`, `2` error de uso. `--json` está disponible para automatización.

El script no puede juzgar el layout visual, la gramática, la credibilidad ni si el PDF realmente se parsea. Para eso, la skill incluye una prueba manual de copiar y pegar.

## Personalización

- **Fuentes y espaciado:** edita `templates/resume.css` o usa `--font-size`.
- **Tamaño de página:** `--a4` para Europa/LATAM; el default es Letter.
- **Encabezados:** mantén los nombres estándar en inglés o español que aparecen en `references/ats-parsing.md`.
- **DOCX:** usa Pandoc si un portal lo exige: `pandoc resume.md -o resume.docx`, y verifica que no haya introducido tablas.
- **Tus datos:** guarda los currículums en `resume/` (ignorado por git) o en un repositorio privado. Nunca subas datos de contacto reales.

## Estructura del repositorio

```text
ats-resume-builder/
├─ SKILL.md                  # Flujo de la skill
├─ README.md / README.es.md  # Documentación (EN/ES)
├─ templates/                # Esqueleto Markdown + CSS de impresión
├─ scripts/
│  ├─ build.mjs              # MD -> HTML -> PDF
│  ├─ ats-check.mjs          # Auditoría local + puntaje de keywords
│  └─ pii-check.mjs          # Control de datos personales
├─ references/               # Verbos, keywords, rúbrica, parsing, casos especiales
├─ examples/                 # Currículum y vacante ficticios
├─ docs/
│  ├─ preview.png            # Captura del ejemplo
│  └─ social-preview.png     # Tarjeta social 1280x640
└─ .github/workflows/        # Validación en CI
```

## Privacidad

- Todo corre localmente. Los scripts no hacen peticiones de red.
- La exportación a PDF usa un perfil temporal del navegador y lo elimina.
- Mantén los currículums reales fuera de repositorios públicos; `.gitignore` excluye `resume/`, `applications/` y `*.local.*`.
- `npm run check:pii` falla si encuentra emails, teléfonos, perfiles o documentos de identidad reales en archivos versionados. CI lo ejecuta en cada pull request, y `npm run hooks` lo activa como hook de pre-commit.
- `.pii-denylist.local` (ignorado por git) bloquea tus propios nombres y empleadores en local sin publicar la lista.
- Redacta nombres de empresas y métricas antes de compartir un CV con cualquier herramienta de terceros.
- La skill se niega a inventar experiencia, métricas, títulos, fechas o certificaciones.

## Limitaciones

- Ninguna herramienta garantiza una entrevista ni el "puntaje ATS" de un proveedor específico.
- La cobertura de keywords es una heurística sobre el texto de la vacante, no un parser comercial.
- El renderizado del PDF depende del navegador instalado; siempre haz la prueba de copiar y pegar.
- El flujo está optimizado para ingeniería de software. Otros campos necesitan otro banco de keywords.
- La documentación está en inglés y español; la skill puede escribir en otros idiomas, pero los alias de secciones y el validador apuntan a EN/ES.

## Contribuir

Issues y pull requests son bienvenidos. Lee [CONTRIBUTING.md](CONTRIBUTING.md). Nunca incluyas datos personales reales, nombres de clientes ni métricas confidenciales en un issue o ejemplo. Para problemas de seguridad, sigue [SECURITY.md](SECURITY.md) en lugar de abrir un issue público.

## Licencia

MIT. Ver [LICENSE](LICENSE).

---

<p align="center">
  <sub>Si esto te ahorra una hora y un rechazo, dale una estrella al repo.<br>Si te enseña por qué un currículum falla, vale más.</sub>
</p>
