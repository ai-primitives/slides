import { createCosmosConfig } from 'react-cosmos'

export default createCosmosConfig(__dirname, {
  staticPath: 'public',
  globalImports: ['./src/test/setup.ts'],
  experimentalRendererUrl: true,
  vite: {
    configPath: './vite.config.ts'
  }
})
