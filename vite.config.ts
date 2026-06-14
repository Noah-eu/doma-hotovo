import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/favicon.svg', 'icons/icon.svg', 'icons/icon-maskable.svg'],
            manifest: {
                name: 'Doma hotovo',
                short_name: 'Doma hotovo',
                description: 'Domácí deník toho, co kdo udělal.',
                theme_color: '#f1cc00',
                background_color: '#fff7b8',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: '/icons/icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any',
                    },
                    {
                        src: '/icons/icon-maskable.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
                navigateFallback: '/index.html',
            },
        }),
    ],
});