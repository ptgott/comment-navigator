# ROADMAP

## Doing now

## Features
- Count all comments by filter within a UI component
- Prev/Next buttons (for navigation across filtered threads) in the UI component
- Refactor filters and chaining (and get the tests to pass). The array of tuples used in `ThreadCollection.chain()` is really messy and hard to debug. Use a simpler data structure. One thing that can help with this is that each `ThreadCollection.filter*` function basically works in the same way. Consider turning each filter into a class constructor (i.e., for a `Filter` class).

## Deployment
- Determine how to run this. Consider making it an add-on: https://developers.google.com/gsuite/add-ons/how-tos/building-editor-addons. Or make it a userscript for Tampermonkey etc.

## Tooling
- Set up a build script with TypeScript and WebPack