#!/usr/bin/env sh

echo "deploying Advisor Frontend"
npm run build
ls

cd dist
ls
rsync -arv -e "ssh -2" * sshacs@unprotected.upload.akamai.com:/114034/insights/platform/advisor/