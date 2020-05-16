# ROADMAP

## Doing now

## Features/application code

- Allow the main calling context--which calls FilterCollection.use()--to read user menu selections from the UI components. Do this periodically before refreshing.
- Refactor `NextButton` and `PrevButton` to share an interface for navigation buttons (also refactor the tests)
- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop

## Tooling

- Set up a build script with TypeScript and WebPack

## Deployment

- Determine how to run this. Consider making it an add-on: https://developers.google.com/gsuite/add-ons/how-tos/building-editor-addons. Or make it a userscript for Tampermonkey etc.
