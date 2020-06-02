#!/bin/bash
# Run the e2e test server manually in the foreground for debugging.
export APP_PORT=3000;
export BUNDLE_PATH="static/js_dist/index.dev.js";
export E2E_GLOBALS_PATH="static/js_dist/e2e_globals.dev.js";

# Get an up-to-date bundle to serve to Puppeteer
echo -ne "Building the asset bundle"
npx webpack --config webpack.e2ebundle.config.js > /dev/null
echo -ne "\t\tdone\n"

echo -ne "Building the test server"
npx webpack --config webpack.e2eserver.config.js > /dev/null
echo -ne "\t\tdone\n"

open http://localhost:3000;
node static/js_dist/test-server.js;