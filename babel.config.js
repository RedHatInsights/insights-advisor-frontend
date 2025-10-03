require.extensions['.css'] = () => undefined;

/**
 * We require a mapper for some PF modules because the modle export names do not match their location
 */

module.exports = {
  presets: ['@babel/env', '@babel/react'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {
        include: ['NODE_ENV'],
      },
      '@babel/plugin-transform-runtime',
    ],
    [
      'formatjs',
      {
        idInterpolationPattern: '[sha512:contenthash:base64:6]',
        ast: true,
      },
    ],
    'lodash',
  ],
  env: {
    componentTest: {
      plugins: ['istanbul'],
    },
  },
};
