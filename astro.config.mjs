import {defineConfig} from 'astro/config'

export default defineConfig({
    site: 'https://andres6936.github.io',
    base: import.meta.env.PROD ? 'Serralta' : '',
})