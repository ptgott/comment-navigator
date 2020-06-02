/**
 * This config bundles the frontend JS for use within e2e tests.
 */

const path = require("path");

module.exports = {
  target: "web", // The default, but included here for clarity
  mode: "development",
  entry: {
    index: path.resolve(__dirname, "src", "index.ts"),
    e2e_globals: path.resolve(__dirname, "src", "e2e-utils", "e2e_globals.ts"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].dev.js",
    path: path.resolve(__dirname, "static", "js_dist"),
  },
};
