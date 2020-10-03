# ROADMAP

## Doing broadly

## Next up in the MVP (by priority)

- When clicking "next" after answering a discussion, we skip the real next discussion. Fix that, then do more exploratory manual testing on the navigation to make sure the navigation buttons work as expected.

- Set up a release process by configuring a GitHub action to sync with a public gist on release. GitHub Actions is free for public repos (https://github.com/features/actions).

  - Figure out how to make a GitHub token safely available to the GitHub Action (i.e., without hardcoding it into the repo).
  - Figure out how to populate the user script with the current version number.
  - Set up this GitHub Action (https://github.com/marketplace/actions/gist-sync) to sync the gist with the latest bundle. (The Action is actually pretty simple and uses a bash script to run `curl` against the GitHub API! Like all Actions, it runs in a Docker container). **Trigger the Action when a GitHub release is created!**
  - Determine how to populate the `@source`, `@updateURL`, and `@downloadURL` user script headers (https://www.tampermonkey.net/documentation.php)
  - Create the GitHub repo (maybe create it as a private repo initially)
  - Push the code and create the first release. You can set up an Action to trigger on release. Creating a release is done through the GitHub UI (https://docs.github.com/en/github/administering-a-repository/managing-releases-in-a-repository), using either an existing git tag or a tag you create.

- Make sure the README is up to snuff

- Fix this bug: If you open the comment history panel with the Comment Navigator script running, an error occurs and the Google Document doesn't load

- Release v1

## Features for after the MVP

- Currently there's no good way to test the navigator against a document with an indefinite number of comment threads. To see how the navigator components render with, say, 1,500 discussions or 50 authors, the current easiest solution is to edit `fixture.yaml` and run `npm run e2e-inspect`. But this doens't play well with the e2e tests as they're currently written.

- When you navigate to a discussion thread in Google Docs, sometimes the default focus behavior will send the thread slightly offscreen. Add some way to direct the user to offscreen threads. Note that one attempt to solve this problem used `scrollBy` to move offscreen threads into view. If this happens during the Google Docs discussion selection animation, the effect is super jarring. The issue isn't severe enough to warrant pervasive scrolljacking.

- Change the minimization flow to reduce the screen real estate of the comment navigator.

  - When initially maximized, show only navigation buttons, plus an option to show filters, and the text indicating how many comments remain
  - When the “show filters” option is shown, show the filter input components
  - This will probably be easiest if we implement the comment navigator as a state machine

- Give the “selectors” package as little surface area as possible. Add a Comment class and include all attributes of comments/threads we'll use in the navigator as attributes of the Comment/CommentThread/ThreadCollection classes.

- Property-based testing for all code that takes arbitrary user input (e.g., and especially, new `Filter`s read from UI input components)

- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop

- Filter by comment length and provide an option to navigate threads in descending/ascending length.
