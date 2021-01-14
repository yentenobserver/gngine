import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/mgr.ts',
  output: [
    {
      file: 'dist/mgr.esm.js',
      format: 'es',
    },
    {
      file: 'dist/mgr.umd.js',
      format: 'umd',
      name: 'Mgr',
    },
  ],
  plugins: [typescript()],
};
