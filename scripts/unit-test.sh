#!/bin/bash
# This is run from the project root. This skips the entrypoint
# since we can only cover that with e2e tests.
unitTestPath="src/lib/**/*.ts";

# Test coverage for unit tests
if [[ $COVERAGE == true ]]; then
    coverageFlags="--collect-coverage --collectCoverageFrom=$unitTestPath";
fi

npx jest $coverageFlags $unitTestPath;

# Open Istanbul in a browser for nice coverage reports
if [[ $COVERAGE == true ]]; then
    open coverage/lcov-report/index.html;
fi