SENTRY_VERSION=6.13.3
BOOTSTRAP_VERSION=3.4.1
BOOTSTRAP_VALIDATOR_VERSION=0.11.9

mkdir -p public/js/sentry/$SENTRY_VERSION/
cp node_modules/@sentry/browser/build/bundle.min.js* public/js/sentry/$SENTRY_VERSION/

mkdir -p public/js/bootstrap/$BOOTSTRAP_VERSION/
mkdir -p public/css/bootstrap/$BOOTSTRAP_VERSION/
mkdir -p public/css/bootstrap/fonts/
cp node_modules/bootstrap/dist/js/bootstrap.min.js* public/js/bootstrap/$BOOTSTRAP_VERSION/
cp node_modules/bootstrap/dist/css/bootstrap.min.css* public/css/bootstrap/$BOOTSTRAP_VERSION/
cp node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.* public/css/bootstrap/fonts/

cp node_modules/bootstrap-validator/dist/validator.min.js public/js/bootstrap-validator-$BOOTSTRAP_VALIDATOR_VERSION.min.js
