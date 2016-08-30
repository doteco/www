aws s3 sync . s3://nic.eco --exclude .gitignore --exclude ".git/*" --exclude deploy.sh $@
