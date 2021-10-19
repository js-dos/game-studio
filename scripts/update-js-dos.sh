#!/bin/bash

yarn add js-dos@latest emulators@latest emulators-ui@latest
rm -rf public/js-dos/*
cp node_modules/js-dos/dist/* public/js-dos/
cp node_modules/emulators/dist/wlibzip* public/js-dos/
