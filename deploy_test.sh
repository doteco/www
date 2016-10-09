NODE_ENV=TST node build.js
aws s3 sync public s3://test.nic.eco $@