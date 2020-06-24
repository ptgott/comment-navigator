# ROADMAP

## Doing now

Write the entrypoint for the package.

**Within that/next:**

- e2e tests
  - Write a little Express server that returns simulated Google Docs comments using the same utility functions as the unit tests
  - Start the Express server using a shell script
  - Also in the shell script, use Puppeteer to visit the test site
  - Use Jest's Puppeteer integration to run e2e tests.

## Next up in the MVP (by priority)

- Add the ability to toggle the navigator on and off

- Determine how to deploy this. Consider making it an add-on: https://developers.google.com/gsuite/add-ons/how-tos/building-editor-addons. Or make it a userscript for Tampermonkey etc.

  - There doesn't seem to be any first-class representation of comments in the Apps Script APIs (https://developers.google.com/apps-script/reference/document)
  - You can develop in Apps Script via TypeScript (https://developers.google.com/apps-script/guides/typescript)
  - The best bet is probably to write a server-side Apps Script program (hosted by Google) that serves HTML with embedded JS (https://developers.google.com/apps-script/guides/html#index.html). This seems like it won’t affect existing frontend code!

- Follow JSDoc conventions more consistently in comments (https://jsdoc.app/about-getting-started.html), e.g. enforcing the `/** */` syntax. Then generate docs.
- Set up a build script with TypeScript and WebPack

## Features for after the MVP

- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop

- Filter by comment length and provide an option to navigate threads in descending/ascending length.

## Tooling
