// Currently this is only used for Jest's TypeScript integration,
// and is based on the example here:
// https://jestjs.io/docs/en/getting-started.html#using-typescript
module.exports = {
    presets: [
      ['@babel/preset-env', {targets: {node: 'current'}}],
      '@babel/preset-typescript',
    ],
  };
  