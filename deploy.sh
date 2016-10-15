NODE_ENV=PRD node build.js
aws s3 sync public s3://nic.eco $@