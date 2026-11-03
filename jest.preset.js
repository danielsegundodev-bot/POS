const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testMatch: ['**/*_spec.ts', '**/*_test.ts'],
};
