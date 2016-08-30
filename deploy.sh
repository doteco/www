aws s3 sync . s3://doteco-www --exclude .gitignore --exclude ".git/*" --exclude deploy.sh $@
