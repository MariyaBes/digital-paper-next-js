// Переопределение webpack-конфига CRA через CRACO.
//
// Проблема 1: webpack по полю `exports` пакета `docx` выбирает ESM-сборку
// (`dist/index.mjs`), а babel-правило CRA для node_modules не умеет её
// транспилировать (падает на `super()` в стрелочной функции).
// Решение: алиасим `docx` на CJS-сборку (`dist/index.cjs`).
//
// Проблема 2: babel-правило CRA матчит только `/\.(js|mjs)$/` — расширение `.cjs`
// туда не попадает, поэтому аliased `.cjs` проваливается в catch-all file-loader
// и эмитится как АССЕТ (его «экспорт» становится URL-строкой, а реальные классы
// docx недоступны). Решение: научить webpack обрабатывать `.cjs` как обычный
// CommonJS-модуль (`type: 'javascript/auto'`, babel при этом не нужен — webpack
// понимает CommonJS нативно).
module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.resolve = webpackConfig.resolve || {};
            webpackConfig.resolve.alias = {
                ...(webpackConfig.resolve.alias || {}),
                docx: require.resolve('docx'),
            };

            const oneOfRule = webpackConfig.module.rules.find((rule) =>
                Array.isArray(rule.oneOf),
            );
            if (oneOfRule) {
                // В начало oneOf — чтобы сработало раньше catch-all file-loader.
                oneOfRule.oneOf.unshift({ test: /\.cjs$/, type: 'javascript/auto' });
            }

            return webpackConfig;
        },
    },
};
