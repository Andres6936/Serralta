// insert-tag-by-filename.ts
import { readdirSync } from "node:fs";
import { join, basename, extname } from "node:path";

const dir = Bun.argv[2];
if (!dir) {
  console.error("❌ Uso: bun run insert-tag-by-filename.ts ./ruta");
  process.exit(1);
}

// Obtener archivos .astro recursivamente
function getAstroFiles(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(root, entry.name);
    if (entry.isDirectory()) return getAstroFiles(full);
    if (entry.isFile() && extname(entry.name) === ".astro") return [full];
    return [];
  });
}

const astroFiles = getAstroFiles(dir);
console.log(`🔍 Encontrados ${astroFiles.length} archivos .astro.\n`);

let modified = 0;

for (const filePath of astroFiles) {
  const name = basename(filePath, ".astro");
  // Extraer número al inicio del nombre (antes del primer '_')
  const match = name.match(/^(\d+)_/);
  if (!match) {
    console.log(`⏭️  Omitido (sin número): ${name}`);
    continue;
  }

  const num = parseInt(match[1], 10); // "01" -> 1, "100" -> 100
  const tag = `<Tag>#${num}</Tag>`;

  let content = await Bun.file(filePath).text();

  // Buscar la primera línea que contenga "<Content" (apertura)
  const lines = content.split("\n");
  const contentIndex = lines.findIndex((line) => /^\s*<Content/.test(line));

  if (contentIndex === -1) {
    console.log(`⚠️  No se encontró <Content> en: ${name}, se omite.`);
    continue;
  }

  // Obtener la indentación de esa línea
  const indentMatch = lines[contentIndex].match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : "";

  const tagLine = indent + tag;

  // Si la línea anterior ya es exactamente este Tag, no duplicar
  if (contentIndex > 0 && lines[contentIndex - 1] === tagLine) {
    console.log(`⏩  Ya tiene el Tag: ${name}`);
    continue;
  }

  // Insertar el tag justo antes de la línea de <Content>
  lines.splice(contentIndex, 0, tagLine);
  const newContent = lines.join("\n");

  await Bun.write(filePath, newContent);
  console.log(`✅ Insertado en: ${name}`);
  modified++;
}

console.log(`\n🎉 Hecho. Se modificaron ${modified} archivos.`);
