SENTRY_VERSION=6.19.7
BOOTSTRAP_VERSION=5.3.2
BOOTSTRAP_VALIDATOR_VERSION=0.11.9

mkdir -p source/js/sentry/$SENTRY_VERSION/
cp node_modules/@sentry/browser/build/bundle.min.js* source/js/sentry/$SENTRY_VERSION/

mkdir -p source/js/bootstrap/$BOOTSTRAP_VERSION/
mkdir -p source/css/bootstrap/$BOOTSTRAP_VERSION/
cp node_modules/bootstrap/dist/js/bootstrap.bundle.min.js* source/js/bootstrap/$BOOTSTRAP_VERSION/
cp node_modules/bootstrap/dist/css/bootstrap.min.css* source/css/bootstrap/$BOOTSTRAP_VERSION/
