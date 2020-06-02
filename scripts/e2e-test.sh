#!/bin/bash

# We need to run a local server to enable jest and puppeteer to work
# together. Otherwise, there are strange issues with timeouts and 
# asynchronicity. It's a lot simpler to have the local server
# and the test suite to run as separate processes.

export APP_PORT=3000;
export BUNDLE_PATH="static/js_dist/index.dev.js";
export E2E_GLOBALS_PATH="static/js_dist/e2e_globals.dev.js";
max_retries=10

# $1 the pid of the local server
close_server (){
    echo -ne "\n\nShutting down the local server."
    kill $1
    echo -ne "\t\tdone\n\n" 
}

# Get an up-to-date bundle to serve to Puppeteer
echo -ne "Building the asset bundle"
npx webpack --config webpack.e2ebundle.config.js > /dev/null
echo -ne "\t\tdone\n"

echo -ne "Building the test server"
npx webpack --config webpack.e2eserver.config.js > /dev/null
echo -ne "\t\tdone\n"

echo -ne "Starting the local server"
node static/js_dist/test-server.js &
LOCAL_SERVER="$!"
echo -ne "\t\tdone\n"

echo "Waiting for a response"
for i in $(seq 1 ${max_retries}); do
    status=$(curl -s "localhost:$APP_PORT/health");
    if [[ $status = ok ]]; then
        break;
    elif [[ "$i" -eq "$max_retries" ]]; then
        echo "Couldn't contact the server!"
        close_server $LOCAL_SERVER
        exit 1
    else
        sleep .5;
    fi
done

echo -e "\n\nRunning the tests.\n\n"
npx jest --config jest.e2e.config.js src/e2e/e2e.test.ts
close_server $LOCAL_SERVER