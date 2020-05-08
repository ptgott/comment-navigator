# ROADMAP

## Doing now

## Features
- Add unit tests for `NavigatorComponent` functions.
- Add a way of tracking the currently selected comment thread (use a filter based on a selector?)
- Achieve more reusable communican between `NavigatorControl`s and the `ThreadCollection`. 
    * Right now, each `NavigatorControl`, like `NavigatorComponent`, takes two arrays of `Element`s, designed to be the results of filtering a `ThreadCollection`.
    * But this means that no `NaivgatorControl` knows what filters have been applied. 
    * Further, it means that we can't apply different filters to different components. This means that we can't feed the selected thread `Element` to the prev/next buttons and the filtered `Elements` to the "filtered/total" counter.
    * One possibility: 
        Remove the `filter*` functions from `ThreadCollection`.
        Extract each `filter*` function into its own class.
        Define a class that contains a `ThreadCollection` as one property and an array of `Filters` as another property. We can apply the filters to the `NavigationControl`s that need them. The composition approach keeps things flexible.
- Prev/Next buttons (for navigation across filtered threads) in the UI component
- Slider for comment navigation. Each stop becomes another comment. Start by dispatching a click for every stop

## Deployment
- Determine how to run this. Consider making it an add-on: https://developers.google.com/gsuite/add-ons/how-tos/building-editor-addons. Or make it a userscript for Tampermonkey etc.

## Tooling
- Start using Prettier
- Set up a build script with TypeScript and WebPack