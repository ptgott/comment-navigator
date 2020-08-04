# ROADMAP

## Doing now

- Dogfood the user script in staging and make usability adjustments

### Current subtask

### Next subtasks

- If you select a comment, the navigation buttons don’t treat it as active and instead start navigating from the first comment. Fix this!
- If you delete or resolve a comment or suggestion, the navigation buttons start from the beginning again—it’d be smoother to start from the next comment. Fix this!
- Allow minimization/maximization by clicking any part of the top edge of the component, which can "light up" to suggest it's manipulable, not the small minimize button (to make minimization faster and easier). Use the cursor to indicate that you can minimize/maximize the navigator.
- Add text to the navigator that you can press escape to minimize
- Get to full test coverage again (and passing tests!)

## Next up in the MVP (by priority)

- Add a license

- Work out a deployment process.

  - Set up the GitHub action to sync with a public gist. Consider using this one (https://github.com/marketplace/actions/gist-sync) to sync the gist with the latest bundle. GitHub Actions is free for public repos (https://github.com/features/actions). Trigger the action when creating a release.
  - Determine the `@updateURL`, and `@downloadURL` user script headers (https://www.tampermonkey.net/documentation.php)

- Release v1

## Features for after the MVP

- When you navigate to a discussion thread in Google Docs, sometimes the default focus behavior will send the thread slightly offscreen. Add some way to direct the user to offscreen threads. Note that one attempt to solve this problem used `scrollBy` to move offscreen threads into view. If this happens during the Google Docs discussion selection animiation, the effect is super jarring. The issue isn't severe enough to warrant pervasive scrolljacking.
- Change the minimization flow to reduce the screen real estate of the comment navigator.
  - When initially maximized, show only navigation buttons, plus an option to show filters, and the text indicating how many comments remain
  - When the “show filters” option is shown, show the filter input components
  - This will probably be easiest if we implement the comment navigator as a state machine
- Give the “selectors” package as little surface area as possible. Add a Comment class and include all attributes of comments/threads we'll use in the navigator as attributes of the Comment/CommentThread/ThreadCollection classes.
- Property-based testing for all code that takes arbitrary user input (e.g., and especially, new `Filter`s read from UI input components)
- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop
- Filter by comment length and provide an option to navigate threads in descending/ascending length.
