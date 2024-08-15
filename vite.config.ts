/// <reference types="vite/client" />
/// <reference types="vitest" />
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
    plugins: [
        react(),
        libInjectCss(),

        // ✅ 테스트 영역은 type 파일 생성 x
        dts({ exclude: ['**/*.stories.tsx'] }),
    ],
    build: {
        lib: {
            // ✅ 라이브러리 진입점 연결
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],

            // ✅ component 단위로 개별 css 호출 적용
            input: Object.fromEntries(
                globSync(['src/components/**/index.tsx', 'src/index.ts']).map((file) => {
                    // This remove `src/` as well as the file extension from each
                    // ¡file, so e.g. src/nested/foo.js becomes nested/foo
                    const entryName = path.relative('src', file.slice(0, file.length - path.extname(file).length));
                    // This expands the relative paths to absolute paths, so e.g.
                    // src/nested/foo becomes /project/src/nested/foo.js
                    const entryUrl = fileURLToPath(new URL(file, import.meta.url));
                    return [entryName, entryUrl];
                })
            ),
            output: {
                // ✅ javascript, css 파일에 대한 outputFile 설정
                entryFileNames: '[name].js',
                assetFileNames: 'assets/[name][extname]',

                globals: {
                    react: 'React',
                    'react-dom': 'React-dom',
                    'react/jsx-runtime': 'react/jsx-runtime',
                },
            },
        },
    },
});
