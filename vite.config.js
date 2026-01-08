import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
  const base = process.env.BASE_PATH || (repo ? `/${repo}/` : '/');
  
  console.log('Vite config - BASE_PATH:', process.env.BASE_PATH);
  console.log('Vite config - repo:', repo);
  console.log('Vite config - final base:', base);
  
  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist'
    }
  }
})