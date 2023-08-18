import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/hexmap3d.ts',
  output: [
    {
      file: 'dist/hexmap3d.esm.js',
      format: 'es'
    },
    {
      file: 'dist/hexmap3d.umd.js',
      format: 'umd',
      name: 'hexmap3d',
      globals: { three: 'THREE' }
    },
  ],
  external:['three'],
  plugins: [typescript()],
};
