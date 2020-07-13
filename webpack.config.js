/**
 * This config is for creating a production JS bundle for
 * running in a browser as a user script.
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const TerserPlugin = require("terser-webpack-plugin");
const CleanPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const stripIndents = require("common-tags").stripIndents;

// Define the user script headers
const headerDoc = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, "headers.yaml"), {
    encoding: "utf8",
  })
);

// Build the user script headers from headerDoc
// See: https://wiki.greasespot.net/Metadata_Block#Syntax
const headers = Object.entries(headerDoc).reduce((accum, entry) => {
  return stripIndents`${accum}
    // @${entry[0]} ${entry[1]}`;
}, "");

module.exports = {
  target: "web", // The default, but included here for clarity
  mode: "production",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            // Add the user script banner.
            preamble: stripIndents`
            // ==UserScript==
            ${headers}
            // ==/UserScript==`,
          },
        },
        extractComments: false,
      }),
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "static", "js_dist"),
  },
  plugins: [new CleanPlugin()],
};
