# ROADMAP

## Doing now

- Dogfood the user script in staging and make usability adjustments

  - Move the bottom corners of the navigator offscreen (or make them square)
  - Allow minimization/maximization by clicking any part of the top edge of the component, which can "light up" to suggest it's manipulable, not the small minimize button (to make minimization faster and easier). Use the cursor to indicate that you can minimize/maximize the navigator.
  - Get to full test coverage again

## Next up in the MVP (by priority)

- Add a license

- Work out a deployment process.

  - Set up the GitHub action to sync with a public gist. Consider using this one (https://github.com/marketplace/actions/gist-sync) to sync the gist with the latest bundle. GitHub Actions is free for public repos (https://github.com/features/actions). Trigger the action when creating a release.
  - Determine the `@updateURL`, and `@downloadURL` user script headers (https://www.tampermonkey.net/documentation.php)

- Release v1

## Features for after the MVP

- Give the “selectors” package as little surface area as possible. Add a Comment class and include all attributes of comments/threads we'll use in the navigator as attributes of the Comment/CommentThread/ThreadCollection classes.
- Property-based testing for all code that takes arbitrary user input (e.g., and especially, new `Filter`s read from UI input components)
- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop
- Filter by comment length and provide an option to navigate threads in descending/ascending length.
