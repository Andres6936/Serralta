// replace-imports.ts
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const NEW_IMPORTS = `import Layout from "@/layout/Layout.astro";
import Title from "@/components/Title.astro";
import DateOf from "@/components/DateOf.astro";
import Cite from "@/components/Cite.astro";
import Verse from "@/components/Verse.astro";
import Tag from "@/components/Tag.astro";
import Bold from "@/components/Bold.astro";
import Content from "@/components/Content.astro";
import Paragraph from "@/components/Paragraph.astro";`;

const dir = Bun.argv[2];
if (!dir) {
  console.error(
    "❌ Debes indicar un directorio: bun run replace-imports.ts ./ruta",
  );
  process.exit(1);
}
if (!statSync(dir).isDirectory()) {
  console.error("❌ La ruta no es un directorio válido.");
  process.exit(1);
}

// Obtener todos los archivos .astro recursivamente
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
  const original = await Bun.file(filePath).text();
  const lines = original.split("\n");

  // Encontrar la primera línea que contenga "<Layout" (ignorando espacios iniciales)
  const layoutIndex = lines.findIndex((line) =>
    line.trimStart().startsWith("<Layout"),
  );

  // Si no hay <Layout, procesamos el archivo entero (comportamiento anterior)
  const headerEnd = layoutIndex === -1 ? lines.length : layoutIndex;
  const headerLines = lines.slice(0, headerEnd);
  const bodyLines = lines.slice(headerEnd);

  // Localizar líneas de import dentro del header
  const importIndices: number[] = [];
  headerLines.forEach((line, i) => {
    if (line.trimStart().startsWith("import ")) importIndices.push(i);
  });

  // Si no hay imports, siguiente archivo
  if (importIndices.length === 0) continue;

  // Obtener la indentación de la primera línea de import
  const firstImportLine = headerLines[importIndices[0]];
  const indentation = firstImportLine.match(/^(\s*)/)?.[1] ?? "";
  const indentedNewImports = NEW_IMPORTS.split("\n")
    .map((l) => indentation + l)
    .join("\n");

  // Reconstruir el header: antes del primer import + nuevos imports + después del último import
  const beforeImports = headerLines.slice(0, importIndices[0]);
  const afterImports = headerLines.slice(
    importIndices[importIndices.length - 1] + 1,
  );
  const newHeader = [
    ...beforeImports,
    indentedNewImports,
    ...afterImports,
  ].join("\n");

  // Unir con el cuerpo (líneas desde <Layout en adelante, o el resto del archivo)
  const newContent = [newHeader, bodyLines.join("\n")].join("\n");

  await Bun.write(filePath, newContent);
  console.log(`✅ Reemplazado: ${filePath}`);
  replacedCount++;
}

console.log(`🎉 Hecho. Se modificaron ${replacedCount} archivos.`);
