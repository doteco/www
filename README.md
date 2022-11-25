# .eco Website [![Build Status](https://circleci.com/gh/doteco/www.svg?style=svg)](https://app.circleci.com/pipelines/github/doteco/www) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


This is the website for [go.eco](https://go.eco).

## Updating the website

For developers, please follow the [local set up instructions below](#local-setup).

For everyone else, the easiest way to make changes directly through the [Github UI](https://github.com/doteco/www).

### Making Changes through the Github UI

Simple updates to the website can be made directly through the [Github.com user interface](https://github.com/doteco/www). If you know the file that you want to edit, you can edit it by clicking the pencil icon in the file header bar. If you don't know the file that you are looking for but know the text to update, you can use the search bar in the page header to find the file you want.

Typically, you will be editing either HTML files (with a `.html` extension) or Markdown files (with a `.md` extension). If you find the need to edit a file with a different extension, please check with a developer.

### File structure

* Most of the pages that you will change are in the `/source` folder. This folder contains the content
* The overall layout for the website is stored in `/layouts`. `default.html` is the layout that is currently used for all pages. Reusable sections (headers, footers, timeline, etc) are stored under `/layouts/partials`.
* Images are stored under `/public/img/`
* CSS is built using the [SASS preprocessor](http://sass-lang.com/) and are stored in `/scss`

### Markdown

Markdown is a simple markup language that can be used to provide some basic style and structure to a webpage. To see examples of how use Markdown, check out this [MarkdownIT Demo](https://markdown-it.github.io/). Markdown files (like this one) will render using the applied styles and structure directly in the Github interface.

### Committing changes

When committing a change to the site, please include a meaningful comment. One sentence describing the change is sufficient. Having good comments makes it easy for us to be able to review the nature of the change at a glance without digging into the details.

The recommended approach is to prefix the comment with the area of the site being changed. Eg. `champions: updated acceptance terms`.

## Deploying Changes

Deploying the website is taken care of by [CircleCI](https://app.circleci.com/pipelines/github/doteco/www). Every time a change is committed it will be automatically deployed to the test site: [test.go.eco](https://test.go.eco).

**Please make sure that sure that you verify your changes on [test.go.eco](https://test.go.eco) after committing your changes.**

By default, all commits are made to the *master* branch. To promote changes to the production site [go.eco](https://go.eco), the *master* branch will need to be merged with the *production* branch. To do this, please follow these instructions:

1. From the [main screen](https://github.com/doteco/www), click on the **New Pull Request** button
2. In the **base:** dropdown, choose _production_
3. Review the changes that will be deployed by scrolling down the page. Make sure that it includes your changes and any other changes that you have verified on [test.go.eco](https://test.go.eco).
4. Enter a comment for your commit and then
5. Click on the **Merge pull request** button.
6. Click on the **Confirm merge** button.
7. Once your changes have been deployed by TravisCI to the production site, check out [test.go.eco](https://test.go.eco) to verify that they have been deployed successfully.


## Developer Instructions

<a name="local-setup"></a>
### Local Setup

1. For OSX, install [Homebrew](http://brew.sh/)
2. Install [git](https://git-scm.com/downloads) `brew install git` (or use the GitHub Desktop client)
2. Install [node.js](http://nodejs.org) `brew install node` (or install directly from http://nodejs.org)
2. Clone the repo `git clone git@github.com:doteco/www.git`
2. In the directory where the repo was cloned into, run `npm install`
3. In the same directory, run `npm run build`
4. Browse to [http://localhost:8080](http://localhost:8080)

### Coding Standards

For CSS/SCSS, we are using [stylelint](https://stylelint.io/) to ensure that our CSS stays clean and error-free. Please run `npm run stylelint` before committing after making changes to the stylesheets and correct any violations you notice. There is a [stylelint plugin for Sublime](https://github.com/kungfusheep/SublimeLinter-contrib-stylelint) that helps ensure that violations are caught directly in the editor.

We are using a stylelint rule set, specified in .stylelintrc, that are based on [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard). We may add additional rules (property ordering, etc) as we move forward.

### Deploying to production

1. Switch to production branch: `git checkout production`
1. Ensure you have the latest: `git pull`
1. Merge in changes from master: `git merge master`
1. `git push`
