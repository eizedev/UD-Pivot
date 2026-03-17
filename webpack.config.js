const path = require("path");

module.exports = {
    mode: "production",
    devtool: "source-map",
    entry: {
        index: "./Components/index.js"
    },
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "[name].[contenthash].bundle.js",
        sourceMapFilename: "[file].map",
        libraryTarget: "umd",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        sourceType: "unambiguous",
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ]
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    externals: {
        UniversalDashboard: "UniversalDashboard",
        react: "react",
        "react-dom": "reactdom"
    }
};