#!/usr/bin/env bash

# Pull from repository
if [[ "$(hostname)" == *.local ]]; then
  git fetch || git rebase -p --autostash FETCH_HEAD
else
  git reset HEAD --hard
  git pull origin master
fi

# Update composer
if ! type -p composer >/dev/null 2>&1; then
  php composer.phar self-update
  php composer.phar install
else
  composer install
fi

# Clear caches
rm -rf var/cache/*

# Update Database Schema if required
if [[ "$1" == "--upgrade" ]]; then
  php bin/console doctrine:schema:update --force
fi

# Run front end stuff
npm install
gulp build
php bin/console assets:install --symlink web

# Clear all caches
rm -rf var/cache/*
php bin/console doctrine:cache:clear-query --env=prod
php bin/console doctrine:cache:clear-result --env=prod
php bin/console doctrine:cache:clear-metadata --env=prod
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod

echo "Don't forget to run any doctrine migrations or schema updates if required"
