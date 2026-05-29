import { defineConfig } from "astro/config";
import masterCSS from "@master/css.astro";

export default defineConfig({
  site: "https://andres6936.github.io/Serralta",
  base: import.meta.env.PROD ? "Serralta" : "",
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
  },
  integrations: [masterCSS()],
});
