/**
 * This config is for creating a production JS bundle for
 * running in a browser.
 */

const path = require("path");

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
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "static", "js_dist"),
  },
};
