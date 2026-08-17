module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['./src'],
        alias: {
          '~': './src',
        },
      },
    ],
    ['react-native-worklets/plugin', {}, 'react-native-worklets'],
    ['react-native-reanimated/plugin', {}, 'react-native-reanimated'],
  ],
};
