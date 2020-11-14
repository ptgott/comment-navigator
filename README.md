# Google Docs comment navigator

## What is this?

A user script for making it easier to manage comments and suggestions in Google Docs. After the first draft, most of the work you put into writing goes into responding to comments. This tool helps you estimate the work you'll need to address feedback and triage your work effectively.

## Why isn't it a Google Docs add-on?

We really wish it could be! Google Docs add-ons don't yet have a good way to deal with comments in suggestion threads, even though these discussions can get just as heated as those in regular comment threads. Suggested insertions are shown along with final text in a document's [content JSON](https://developers.google.com/docs/api/how-tos/suggestions). `Paragraph` objects within the response to `document.get()` include `TextRun` objects (https://developers.google.com/docs/api/reference/rest/v1/documents#TextRun), which include `suggestedInsertionIds[]` and `suggestedDeletionIds[]` as properties. But these don't currently point to anything else. Let us know when they do!

## Contributing

- We use Prettier for formatting. If you're using VSCode, `.vscode/settings.json` configures Prettier to format on save.
- We use Jest for testing. Run `npm test` to run unit tests. `npm run coverage` also runs the tests, then opens Jest's code coverage report in your browser. Use this when you want to plan the next tests to write. (This only applies to unit tests.) Use `npm run e2e` for e2e tests. This will boot a local web server that returns a static site running the comment navigator within a super bare-bones simulation of a Google Doc, run tests against it using Puppeteer, then shut down the server. To poke around in this environment manually, run `npm run e2e-inspect.
- Any bug fix should include new tests to reproduce the bug and prevent regression of the fix. Ideally, these should be unit tests since they're faster and more isolated from one another, but complex scenarios may require e2e tests.
- User script headers, including the official version number, are listed in **headers.yaml**. These are added to the user script at build time. Some headers, like the `@source`, are generated dynamically based on your environment.

## Staging

To stage a full version of the user script so you can try out your changes before creating a pull request, run `npm run to-staging`. This will build the user script and push it to a secret gist in your GitHub account. `to-staging` needs to run with the `GITHUB_TOKEN` environment variable set to an API token that is authorized to create gists. If this is successful, it will output the URL of your new gist. Secret gists in GitHub are accessible without authentication to anyone with the URL.

## Releasing

Releasing the user script means uploading to a domain where it will be available to clients as a static JS file. Anyone who has copied the user script to Tampermonkey or similar should be able to access updates through their user script manager. We use GitHub Actions to edit a public gist when we release a new version of the comment navigator.
