import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/gamengine.ts',
  output: [
    {
      file: 'dist/gamengine.esm.js',
      format: 'es',
      globals: { three: 'THREE' }
    },
    {
      file: 'dist/gamengine.umd.js',
      format: 'umd',
      name: 'gngine',
      globals: { three: 'THREE' }
    },
  ],
  external:['three'],
  plugins: [typescript()],
};
