const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: ['./src/webview/main.ts'],
  bundle: true,
  outfile: './out/webview/game.js',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
  format: 'iife',
  globalName: 'LobsterGame',
  external: [],
  loader: {
    '.ts': 'ts'
  }
}).then(() => {
  console.log('✅ Webview bundle built successfully with esbuild');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
