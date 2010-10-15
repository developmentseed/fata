#!/bin/sh
APP_DIR=`dirname $0`;

# Make sure we're in the application directory as we run things.
# TODO determine why this is required.
cd $APP_DIR

$APP_DIR/bin/node $APP_DIR/app.js
