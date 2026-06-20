// replace-tags.ts
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const dir = Bun.argv[2];
if (!dir) {
  console.error(
    "❌ Debes indicar un directorio: bun run replace-tags.ts ./ruta",
  );
  process.exit(1);
}
if (!statSync(dir).isDirectory()) {
  console.error("❌ La ruta no es un directorio válido.");
  process.exit(1);
}

// Mapeo de etiquetas a reemplazar (en minúsculas) -> nueva etiqueta
const TAG_MAP: Record<string, string> = {
  p: "Paragraph",
  strong: "Bold",
};

// Obtener recursivamente todos los archivos .astro
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

let modifiedCount = 0;

for (const filePath of astroFiles) {
  let content = await Bun.file(filePath).text();
  let modified = false;

  for (const [oldTag, newTag] of Object.entries(TAG_MAP)) {
    // Expresión regular para etiquetas de apertura con o sin atributos (incluye auto-cierre)
    const openRegex = new RegExp(`<(${oldTag})(\\s[^>]*)?(\\/)?>`, "gi");
    const newOpen = content.replace(
      openRegex,
      (match, tagName, attributes, selfClose) => {
        modified = true;
        if (selfClose) {
          return `<${newTag}${attributes ?? ""} />`;
        }
        return `<${newTag}${attributes ?? ""}>`;
      },
    );

    // Expresión regular para etiquetas de cierre
    const closeRegex = new RegExp(`<\\/(${oldTag})\\s*>`, "gi");
    const newClose = newOpen.replace(closeRegex, (match) => {
      modified = true;
      return `</${newTag}>`;
    });

    content = newClose;
  }

  if (modified) {
    await Bun.write(filePath, content);
    console.log(`✅ Modificado: ${filePath}`);
    modifiedCount++;
  }
}

console.log(`🎉 Hecho. Se modificaron ${modifiedCount} archivos.`);
