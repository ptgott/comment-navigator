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
const process = require("process");

// Read the license and convert it to a JS comment
const licenseComment = fs
  .readFileSync("./LICENSE", { encoding: "utf8" })
  .replace(/^/gm, "// ");

// Define the user script headers
let headerDoc = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, "headers.yaml"), {
    encoding: "utf8",
  })
);

// Dynamically add the source header using an environment variable.
// Intended to be used after retrieving the URL of the gist
// dynamically.
if (process.env.gistUrl) {
  headerDoc.source = process.env.gistUrl;
}

// When releasing, use the GITHUB_REF env var to set the version header of the 
// userscript. See:
// https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#release
if (process.env.GITHUB_REF) {
  // Throws an error if GITHUB_REF doesn't include a number. It should, since
  // it will be a version-based tag.
  headerDoc.version = process.env.GITHUB_REF.match(/[0-9\.]+/)[0];
}

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
            // Don't remove whitespace
            beautify: true,
            // Add the user script banner.
            preamble: stripIndents`
            // ==UserScript==
            ${headers}
            // ==/UserScript==
            //
            ${licenseComment}`,
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
