#!/usr/bin/env bash

# Pull from repository
if [[ "$(hostname)" == *.local ]]; then
  git fetch || git rebase -p --autostash FETCH_HEAD
else
  git reset HEAD --hard
  git pull origin master
fi

if [[ ! -f '_config/parameters.yml' ]]; then
  cp _config/parameters.yml.dist _config/parameters.yml
fi

if [[ ! -f '.env' ]]; then
  cp .env.dist .env
fi

# Run front end stuff
bundle install --path vendor/bundle
npm install
gulp build
