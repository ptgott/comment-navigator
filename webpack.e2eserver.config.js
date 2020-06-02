/**
 * This config is for building the local server code for
 * running end-to-end tests. You should be able to run
 * the local test server by running
 * node path/to/test-server.js
 */

const path = require("path");

module.exports = {
  mode: "development",
  target: "node",
  entry: path.resolve(__dirname, "src", "e2e-utils", "server.ts"),
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
    filename: "test-server.js",
    path: path.resolve(__dirname, "static", "js_dist"),
  },
};
