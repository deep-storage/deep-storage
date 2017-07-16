const { CheckerPlugin } = require('awesome-typescript-loader')
const path = require('path');

module.exports = {

    entry: [
        path.join(process.cwd(), 'src/index.tsx'), // Start with src/index.tsx
    ],

    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    // Source maps support ('inline-source-map' also works)
    devtool: 'source-map',

    // Add the loader for .ts files.
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new CheckerPlugin()
    ]
};