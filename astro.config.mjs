import {defineConfig} from 'astro/config'

export default defineConfig({
    site: 'https://andres6936.github.io/Serralta',
    base: import.meta.env.PROD ? '/Serralta' : '',
    i18n: {
        locales: ['en', 'es'],
        defaultLocale: 'en',
    }
})