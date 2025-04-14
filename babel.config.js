module.exports = function (api) {
    api.cache(true);

    const isProduction = process.env.NODE_ENV === 'production';

    return {
        presets: ['babel-preset-expo'],
        plugins: [
            '@babel/plugin-transform-export-namespace-from',
            'react-native-web',
            'react-native-reanimated/plugin',

            isProduction && ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ].filter(Boolean),
    };
};
