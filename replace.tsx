// replace-section-to-container.ts
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const dir = Bun.argv[2];
if (!dir) {
  console.error(
    "❌ Indica un directorio: bun run replace-section-to-container.ts ./ruta",
  );
  process.exit(1);
}
if (!statSync(dir).isDirectory()) {
  console.error("❌ La ruta no es un directorio válido.");
  process.exit(1);
}

// Cadena exacta de la etiqueta de apertura (sin comillas de escape)
const OPEN_TAG = `<section>`;
// Expresión regular para capturar TODO el bloque, incluyendo saltos de línea (dotAll: true)
const BLOCK_REGEX = new RegExp(
  escapeRegExp(OPEN_TAG) + `(.*?)<\\/section>`,
  "gis", // g = global, i = ignorar mayúsculas/minúsculas, s = dotAll (el punto cubre \n)
);

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAstroFiles(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) return getAstroFiles(fullPath);
    if (entry.isFile() && extname(entry.name) === ".astro") return [fullPath];
    return [];
  });
}

const astroFiles = getAstroFiles(dir);
console.log(`🔍 Encontrados ${astroFiles.length} archivos .astro.`);

let replacedCount = 0;

for (const filePath of astroFiles) {
  let content = await Bun.file(filePath).text();
  const original = content;

  // Reemplazar cada bloque <section ...>contenido</section> por <Content>contenido</Content>
  content = content.replace(BLOCK_REGEX, "<Content>$1</Content>");

  if (content !== original) {
    await Bun.write(filePath, content);
    console.log(`✅ Reemplazado: ${filePath}`);
    replacedCount++;
  }
}

console.log(`🎉 Hecho. Se modificaron ${replacedCount} archivos.`);
