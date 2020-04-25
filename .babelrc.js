const presets = [
  [
    "@babel/preset-env",
    {
      "useBuiltIns": "entry",
      "targets": {
        "browsers": "last 2 versions,> 1%,ie >= 11"
      },
      "corejs": "core-js@3"
    }
  ],
  '@babel/preset-react',
  '@babel/preset-typescript',
]
const plugins = [
  "@babel/plugin-proposal-class-properties",
];
module.exports = {
  presets,
  plugins
};