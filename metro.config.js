const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
  resolver: {
    sourceExts: ['js', 'ts', 'tsx', 'svg'],
  },
});

// Добавляем поддержку для react-native-web-maps
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native': require.resolve('react-native-web'),
  'react-native-maps': require.resolve('@teovilla/react-native-web-maps'),
};

// Настройка для поддержки Web
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Добавляем расширения файлов, которые должны обрабатываться как ассеты
config.resolver.assetExts.push(
    'db', 'sqlite', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'
);

module.exports = config;