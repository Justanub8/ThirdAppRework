module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['./src'],
        alias: {
          '~': './src',
          '@': './src',
          '@api': './src/api',
          '@assets': './src/assets',
          '@components': './src/components',
          '@constants': './src/constants',
          '@context': './src/context',
          '@hooks': './src/hooks',
          '@interfaces': './src/interfaces',
          '@layouts': './src/layouts',
          '@locales': './src/locales',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@services': './src/services',
          '@store': './src/store',
          '@types': './src/types',
          '@utils': './src/utils',
          '@validations': './src/validations',
        },
      },
    ],
    ['react-native-worklets/plugin', {}, 'react-native-worklets'],
    ['react-native-reanimated/plugin', {}, 'react-native-reanimated'],
  ],
};
