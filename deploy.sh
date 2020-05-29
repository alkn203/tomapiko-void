#!/bin/sh
git add .
git commit -m "main.js update"
git config credential.helper 'cache'
git push
