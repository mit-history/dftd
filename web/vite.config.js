import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'^/data(?:/|\\?|$)': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				ws: true,
				rewrite: path => {
					const stripped = path.replace(/^\/data(?=\/|\?|$)/, '');
					return stripped.startsWith('/') ? stripped : `/${stripped}`;
				}
			},
			'^/(?:_observablehq|_import|_file|_npm|_node|_jsr|_duckdb)(?:/|\\?|$)': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				ws: true
			}
		}
	}
});
