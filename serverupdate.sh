#!/usr/bin/env bash

# Pull from repository
if [[ "$(hostname)" == *.local ]]; then
  git fetch || git rebase -p --autostash FETCH_HEAD
else
  git reset HEAD --hard
  git pull origin master
fi

# Run front end stuff
npm install
gulp build
