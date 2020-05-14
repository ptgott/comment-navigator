# ROADMAP

## Doing soon

## Features

- Get to 100% test coverage.
- Allow the main calling context--which calls FilterCollection.use()--to read user menu selections from the UI components. Do this periodically before refreshing.
- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop

## Tooling

- Develop better fixtures for testing.

  - Consider test-specific utility functions that generate dummy elements, avoiding the need for a hard-to-read HTML file.
  - If we go with the utility-function approach, make unit tests more isolated from one another.
  - If we're sticking with test.html, replace it with a document that's easier to visualize in the browser. Right now you have to read the HTML and guess its correspondence to the Google Doc. Part of this is the fact that test.html doesn't load external stylesheets.
  - Most test files load test.html--if we decide to keep using it, consider extracting that behavior to a separate file that Jest executes before any test.

- Set up test debugging with Jest and VSCode
- Set up a build script with TypeScript and WebPack

## Deployment

- Determine how to run this. Consider making it an add-on: https://developers.google.com/gsuite/add-ons/how-tos/building-editor-addons. Or make it a userscript for Tampermonkey etc.
