// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

// Определяем окружение для оптимизаций
const isProduction = process.env.NODE_ENV === 'production';

// Оптимизация resolver
config.resolver = {
  ...config.resolver,
  sourceExts: [
    ...config.resolver.sourceExts,
    'svg', // Добавляем SVG в sourceExts
    'mjs',
    'cjs'
  ],
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),

  // Критически важные алиасы для web-сборки
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    'react-native': require.resolve('react-native-web'),
    'react-native-maps': require.resolve('@teovilla/react-native-web-maps'),
    'react-native-vector-icons': require.resolve('@expo/vector-icons'),
  },

  resolverMainFields: ['react-native', 'browser', 'main'],
  unstable_enablePackageExports: true,
};

// Оптимизация transformer (без react-native-svg-transformer)
config.transformer = {
  ...config.transformer,
  // Убрали babelTransformerPath для SVG
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),

  // Агрессивная оптимизация только для production
  minifierConfig: isProduction ? {
    compress: {
      drop_console: true,
      drop_debugger: true,
      reduce_funcs: false,
      passes: 2,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
    mangle: {
      safari10: true,
      keep_classnames: true,
      keep_fnames: true,
    },
    output: {
      comments: false,
      ascii_only: true,
      beautify: false,
    },
  } : undefined,
};

// Оптимизация производительности
config.maxWorkers = process.env.CI ? 2 : Math.max(1, Math.floor(require('os').cpus().length / 2));
config.cacheVersion = `v1-${isProduction ? 'prod' : 'dev'}`;

// Оптимизация сервера
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Кэширование статических ресурсов
      const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot'];
      if (staticExtensions.some(ext => req.url.endsWith(ext))) {
        res.setHeader('Cache-Control', isProduction ? 'public, max-age=31536000, immutable' : 'no-cache');
      }
      return middleware(req, res, next);
    };
  },
};

// Игнорируем ненужные папки для наблюдения
config.watchFolders = [__dirname];

// Полный список ассетов
config.resolver.assetExts = [
  ...new Set([
    ...config.resolver.assetExts,
    'db', 'sqlite', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp',
    'ttf', 'otf', 'woff', 'woff2', 'pdf', 'mp4', 'mp3', 'wav'
  ])
];

module.exports = config;