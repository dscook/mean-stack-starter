#!/bin/bash

# https://github.com/sass/node-sass/issues/983
npm rebuild node-sass

if [ $# -eq 0 ]; then
    npm run start
  else
    npm run "$@"
fi
