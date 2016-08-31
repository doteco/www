aws s3 sync . s3://test.nic.eco --exclude .gitignore --exclude ".git/*" --exclude "deploy*.sh" $@
