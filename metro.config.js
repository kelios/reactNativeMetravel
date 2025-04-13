const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
  resolver: {
    sourceExts: ['js', 'ts', 'tsx', 'svg'],
  },
});

// Поддержка react-native-web-maps
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native': require.resolve('react-native-web'),
  'react-native-maps': require.resolve('@teovilla/react-native-web-maps'),
};

// Настройка трансформера
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Удаление console.* и минификация
config.transformer.minifierConfig = {
  compress: {
    drop_console: true, // 💥 Удаляет console.log и подобные
    passes: 2,
  },
  mangle: {
    safari10: true,
  },
  output: {
    comments: false,
    ascii_only: true,
  },
};

// Добавляем ассеты
config.resolver.assetExts.push(
    'db', 'sqlite', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'
);

module.exports = config;
