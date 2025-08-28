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
                alias: { '@': './' },
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
            }],

            isProduction && ['transform-remove-console', { exclude: ['error', 'warn'] }],

            'react-native-reanimated/plugin',
        ].filter(Boolean),
    };
};
