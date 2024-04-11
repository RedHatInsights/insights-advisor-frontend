require.extensions['.css'] = () => undefined;

/**
 * We require a mapper for some PF modules because the modle export names do not match their location
 */

module.exports = {
  presets: ['@babel/env', '@babel/react', '@babel/flow'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {
        include: ['NODE_ENV'],
      },
    ],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
    'lodash',
    '@babel/plugin-proposal-class-properties',
  ],
};
