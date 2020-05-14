# ROADMAP

## Doing soon

- Set up code coverage reporting after tests (this will make it easier to add tests for the refactored code)
- Write unit tests for new classes that currently lack them.

## Features

- Allow the main calling context--which calls FilterCollection.use()--to read user menu selections from the UI components. Do this periodically before refreshing.
- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop

## Tooling

- Set up test debugging with Jest and VSCode
- Replace test.html with something that's easier to visualize in the browser. Right now you have to read the HTML and guess its correspondence to the Google Doc. Part of this is the fact that test.html doens't load external stylesheets.
- Set up a build script with TypeScript and WebPack

## Deployment

- Determine how to run this. Consider making it an add-on: https://developers.google.com/gsuite/add-ons/how-tos/building-editor-addons. Or make it a userscript for Tampermonkey etc.
