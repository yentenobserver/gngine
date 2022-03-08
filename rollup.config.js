import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/gamengine.ts',
  output: [
    {
      file: 'dist/gamengine.esm.js',
      format: 'es',
    },
    {
      file: 'dist/gamengine.umd.js',
      format: 'umd',
      name: 'Mgr22',
    },
  ],
  plugins: [typescript()],
};
