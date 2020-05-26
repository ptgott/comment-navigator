# ROADMAP

## Doing now

## Features/application code

- Write the entrypoint for the package. It will probably:

  1. Render the navigator
  2. Refresh the navigator
  3. In a loop:
     1. Read the menus of the navigator
     2. Create filters from the menus
     3. Apply the filters (FiltrationRecord)
     4. Refresh the navigator

- e2e tests

## Features for after the MVP

- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop

## Tooling

- Follow JSDoc conventions more consistently in comments (https://jsdoc.app/about-getting-started.html), e.g. enforcing the `/** */` syntax. Then generate docs.
- Set up a build script with TypeScript and WebPack

## Deployment

- Determine how to run this. Consider making it an add-on: https://developers.google.com/gsuite/add-ons/how-tos/building-editor-addons. Or make it a userscript for Tampermonkey etc.

  - There doesn't seem to be any first-class representation of comments in the Apps Script APIs (https://developers.google.com/apps-script/reference/document)
  - You can develop in Apps Script via TypeScript (https://developers.google.com/apps-script/guides/typescript)
  - The best bet is probably to write a server-side Apps Script program (hosted by Google) that serves HTML with embedded JS (https://developers.google.com/apps-script/guides/html#index.html). This seems like it won’t affect existing frontend code!
