// .babelrc.js
module.exports = function (api) {
    api.cache(true);
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        presets: ['babel-preset-expo'],
        plugins: [
            '@babel/plugin-transform-export-namespace-from',
            'react-native-web',
            ['module-resolver', {
                root: ['./'],
                alias: {
                    '@': './',
                    '@/components': './src/components',
                    '@/screens': './src/screens',
                    '@/assets': './assets',
                    '@/utils': './src/utils',
                    '@/hooks': './src/hooks',
                    '@/types': './src/types',
                },
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
            }],
            isProduction && ['transform-remove-console', {
                exclude: ['error', 'warn', 'info']
            }],
            'react-native-reanimated/plugin',
        ].filter(Boolean),
    };
};