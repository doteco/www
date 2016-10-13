# .eco Website

This is the website for [nic.eco](http://nic.eco).

## Setup

1. For OSX, install [Homebrew](http://brew.sh/) 
2. Install [git](https://git-scm.com/downloads) `brew install git` (or use the GitHub Desktop client)
2. Install [node.js](http://nodejs.org) `brew install node` (or install directly from http://nodejs.org)
2. Clone the repo `git clone git@github.com:doteco/www.git`
2. In the directory where the repo was cloned into, run `npm install`
3. In the same directory, run `npm run build`
4. Browse to [http://localhost:8080](http://localhost:8080)


## Deploy

1. Install AWS CLI `brew install awscli`
2. Set up AWS credentials (aws_access_key_id, aws_secret_access_key)
3. Run `deploy_test.sh` to deploy to the test site or `deploy.sh` to deploy to the production site.
