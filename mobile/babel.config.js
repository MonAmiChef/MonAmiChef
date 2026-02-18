module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Supprime "react-native-worklets/plugin" s'il était ici
      'react-native-reanimated/plugin', // TOUJOURS EN DERNIER
    ],
  };
};
