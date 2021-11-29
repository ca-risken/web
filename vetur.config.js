// vetur.config.js
/** @type {import('vls').VeturConfig} */
module.exports = {
  settings: {
    "vetur.useWorkspaceDependencies": true,
    "vetur.experimental.templateInterpolationService": true
  },
  projects: [
    './',
    {
      root: './',
      package: './package.json',
      globalComponents: [
        './src/components/*.vue',
        './src/components/**/*.vue',
        './src/view/*.vue',
        './src/view/**/*.vue'
      ]
    }
  ]
}
