const CracoLessPlugin = require('craco-less');
const path = require("path");
module.exports = {
    webpack: {
        alias: {
            '@src': path.resolve(__dirname, "src"),
        }
    },
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: {
                            '@primary-color': '#338722',
                        },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};
