// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const os = require('os');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

const isProduction = process.env.NODE_ENV === 'production';

// ---------- Resolver ----------
config.resolver = {
  ...config.resolver,

  // Расширения исходников
  sourceExts: Array.from(new Set([
    ...(config.resolver.sourceExts || []),
    'svg', 'mjs', 'cjs'
  ])),

  // Отдаём web-friendly сборки раньше
  /** Для web даём приоритет ESM/браузерным полям,
   * чтобы лучше работало деревоотряхивание/минификация */
  resolverMainFields: ['browser', 'module', 'react-native', 'main'],

  // SVG как исходник, не ассет
  assetExts: (config.resolver.assetExts || []).filter(ext => ext !== 'svg'),

  // Критические алиасы для web
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    'react-native': require.resolve('react-native-web'),
    'react-native-maps': require.resolve('@teovilla/react-native-web-maps'),
    'react-native-vector-icons': require.resolve('@expo/vector-icons'),
  },

  unstable_enablePackageExports: true,
};

// Полный список ассетов (без дублей)
config.resolver.assetExts = Array.from(new Set([
  ...(config.resolver.assetExts || []),
  'db','sqlite','png','jpg','jpeg','gif','ico','webp',
  'ttf','otf','woff','woff2','pdf','mp4','mp3','wav'
]));

// ---------- Transformer ----------
config.transformer = {
  ...config.transformer,

  // Важен для старта: ленивые requires на web снижают TBT
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),

  // Более агрессивная минификация в проде
  minifierConfig: isProduction ? {
    ecma: 2020,
    module: true,     // позволяем toplevel оптимизации в ESM
    toplevel: true,   // выкидываем неиспользуемое из верхнего уровня
    compress: {
      passes: 3,
      drop_console: true,
      drop_debugger: true,
      reduce_funcs: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
    mangle: {
      safari10: true,
      // ДАЁМ манглить имена для лучшего сжатия/быстрее парсинга
      keep_classnames: false,
      keep_fnames: false,
    },
    output: {
      comments: false,
      ascii_only: true,
      beautify: false,
    },
  } : undefined,
};

// ---------- Server ----------
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Кэшируем статические ресурсы
      const staticExtensions = [
        '.js','.css','.png','.jpg','.jpeg','.gif','.svg',
        '.ico','.webp','.woff','.woff2','.ttf','.eot'
      ];
      if (staticExtensions.some(ext => req.url.endsWith(ext))) {
        res.setHeader(
            'Cache-Control',
            isProduction ? 'public, max-age=31536000, immutable' : 'no-cache'
        );
      }
      return middleware(req, res, next);
    };
  },
};

// ---------- Misc ----------
config.maxWorkers = process.env.CI
    ? 2
    : Math.max(1, Math.floor(os.cpus().length * 0.75)); // чуть агрессивнее для сборки

config.cacheVersion = `v1-${isProduction ? 'prod' : 'dev'}`;

config.watchFolders = [__dirname];

module.exports = config;
