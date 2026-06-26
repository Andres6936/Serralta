// extract-title-simple.ts
import { readdirSync } from "node:fs";
import { join, basename, extname } from "node:path";

const dir = Bun.argv[2];
if (!dir) {
  console.error("❌ Uso: bun run extract-title-simple.ts ./carpeta");
  process.exit(1);
}

function getAstroFiles(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(root, entry.name);
    if (entry.isDirectory()) return getAstroFiles(full);
    if (entry.isFile() && extname(entry.name) === ".astro") return [full];
    return [];
  });
}

const files = getAstroFiles(dir);
console.log(`🔍 Encontrados ${files.length} archivos .astro.\n`);

let modified = 0;

for (const filePath of files) {
  let content = await Bun.file(filePath).text();

  // Buscar bloque <Content ...> ... </Content>
  const contentMatch = content.match(/<Content[^>]*>([\s\S]*?)<\/Content>/i);
  if (!contentMatch) {
    console.log(`⚠️  Sin <Content> en: ${basename(filePath)}`);
    continue;
  }

  const inner = contentMatch[1];
  // Buscar primer <Paragraph> que contiene <Bold> (admite atributos)
  const paraMatch = inner.match(
    /<Paragraph[^>]*>\s*<Bold[^>]*>(.*?)<\/Bold>\s*<\/Paragraph>/is,
  );
  if (!paraMatch) {
    console.log(`⏭️  Sin título en: ${basename(filePath)}`);
    continue;
  }

  const fullParagraph = paraMatch[0];
  const titleText = paraMatch[1].trim();
  if (!titleText) {
    console.log(`⚠️  Título vacío en: ${basename(filePath)}`);
    continue;
  }

  // Eliminar ese párrafo del interior de <Content>
  const newInner = inner.replace(fullParagraph, "");
  content = content.replace(inner, newInner);

  // ── Insertar <Title> antes de <Tag> ──
  const tagLineRegex = /(\s*)<Tag>#\d+<\/Tag>/;
  const tagMatch = content.match(tagLineRegex);
  if (!tagMatch) {
    console.log(`⚠️  No se encontró <Tag> en: ${basename(filePath)}`);
    continue;
  }

  const indent = tagMatch[1]; // espacios antes de <Tag>
  const titleLine = `${indent}<Title>${titleText}</Title>`;
  // Insertar la nueva línea justo antes de la línea del <Tag>
  content = content.replace(tagLineRegex, `${titleLine}\n${tagMatch[0]}`);

  await Bun.write(filePath, content);
  console.log(`✅ Título insertado en: ${basename(filePath)}`);
  modified++;
}

console.log(`\n🎉 Hecho. Se modificaron ${modified} archivos.`);
