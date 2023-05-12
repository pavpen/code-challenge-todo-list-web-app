#!/bin/bash

pushd todo-client || exit 1

yarn concurrently -c "bgGreenBright.bold,bgBlueBright.bold" \
                  -k \
                  --names "Todo Server,Todo Client" \
  "../todo-server/gradlew -p ../todo-server/ bootRun" \
  "yarn start"

popd || exit 1
