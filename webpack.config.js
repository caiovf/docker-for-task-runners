const path = require("path");
const fs = require("fs");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserTPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const themeLabel = "Webpack";
const themeName = "webpack";
const authorName = "c.ferreira";

const projectDist = `wp-content/themes/${themeName}`;
const projectSrc = "app";

module.exports = (env, argv) => {
  return {
    context: path.resolve(__dirname),
    watch: true,
    watchOptions: {
      ignored: "**/node_modules",
    },
    entry: {
      main: [
        path.resolve(__dirname, "app/js/script.js"),
        path.resolve(__dirname, "app/css/style.scss"),
      ],
    },
    output: {
      path: path.resolve(__dirname, projectDist),
      filename: "js/[name].js",
      chunkFilename: "js/[name].js",
      // clean: true,
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserTPlugin({
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { sourceMap: true } },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { sourceMap: true } },
            {
              loader: "sass-loader",
              options: { implementation: require("sass"), sourceMap: true },
            },
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|webp|ico)$/,
          type: "asset/resource",
          use: ["file-loader"],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/[name].css",
        chunkFilename: "css/[name].css",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "app"),
            globOptions: {
              ignore: ["**/css/**/*.scss", "**/js/**/*.js"],
            },
            noErrorOnMissing: true,
          },
        ],
      }),
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {
            const cssContent = `/* Theme Name: ${themeLabel}
                        Author: ${authorName} */`;
            fs.writeFileSync(
              path.resolve(__dirname, `${projectDist}/style.css`),
              cssContent
            );
          });
        },
      },
      new CleanWebpackPlugin(),
    ],
  };
};
