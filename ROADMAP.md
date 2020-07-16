# ROADMAP

## Doing now

## Next up in the MVP (by priority)

- Add the ability to toggle the navigator on and off

- Follow JSDoc conventions more consistently in comments (https://jsdoc.app/about-getting-started.html), e.g. enforcing the `/** */` syntax. Then generate docs.

- Make this easily downloadable and determine the `@updateURL`, and `@downloadURL` user script headers (https://www.tampermonkey.net/documentation.php): Host this on a gist!

  - Gists are GitHub repos--you can create/update them via the API (https://docs.github.com/en/rest/reference/gists).
  - The gist should include the URL of the main repo in case users want to contribute! (Need to edit the bundle banner)
  - Look into using GitHub Actions (e.g. this one: https://github.com/marketplace/actions/gist-sync) to sync the gist with the latest bundle. GitHub Actions is free for public repos (https://github.com/features/actions). Trigger the action when creating a release.

## Features for after the MVP

- Give the “selectors” package as little surface area as possible. Add a Comment class and include all attributes of comments/threads we'll use in the navigator as attributes of the Comment/CommentThread/ThreadCollection classes.
- Property-based testing for all code that takes arbitrary user input (e.g., and especially, new `Filter`s read from UI input components)
- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop
- Filter by comment length and provide an option to navigate threads in descending/ascending length.
