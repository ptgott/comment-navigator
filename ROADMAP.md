# ROADMAP

## Doing now

## Next up in the MVP (by priority)

- If you select a comment, the navigation buttons don’t treat it as active and instead start navigating from the first comment. Fix this!

- If you delete or resolve a comment or suggestion, the navigation buttons start from the beginning again—it’d be smoother to start from the next comment. Fix this!

- Get to full test coverage again (and passing tests!)

- Add a license

- Work out a deployment process.

  - Set up the GitHub action to sync with a public gist. Consider using this one (https://github.com/marketplace/actions/gist-sync) to sync the gist with the latest bundle. GitHub Actions is free for public repos (https://github.com/features/actions). Trigger the action when creating a release.
  - The user script headers should link to the source code (they currently don’t). Maybe the `@source` header should always point to the GitHub repo, and the `@downloadUrl` header is populated dynamically when deploying to staging?
  - Determine the `@updateURL`, and `@downloadURL` user script headers (https://www.tampermonkey.net/documentation.php)

* Release v1

## Features for after the MVP

<<<<<<< HEAD

- # When you navigate to a discussion thread in Google Docs, sometimes the default focus behavior will send the thread slightly offscreen. Add some way to direct the user to offscreen threads. Note that one attempt to solve this problem used `scrollBy` to move offscreen threads into view. If this happens during the Google Docs discussion selection animiation, the effect is super jarring. The issue isn't severe enough to warrant pervasive scrolljacking.
  > > > > > > > 69f25a1... Update the ROADMAP
- Change the minimization flow to reduce the screen real estate of the comment navigator.
  - When initially maximized, show only navigation buttons, plus an option to show filters, and the text indicating how many comments remain
  - When the “show filters” option is shown, show the filter input components
  - This will probably be easiest if we implement the comment navigator as a state machine
- Give the “selectors” package as little surface area as possible. Add a Comment class and include all attributes of comments/threads we'll use in the navigator as attributes of the Comment/CommentThread/ThreadCollection classes.
- Property-based testing for all code that takes arbitrary user input (e.g., and especially, new `Filter`s read from UI input components)
- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop
- Filter by comment length and provide an option to navigate threads in descending/ascending length.
