BOOTSTRAP_VERSION=5.3.2

mkdir -p source/js/bootstrap/$BOOTSTRAP_VERSION/
mkdir -p source/css/bootstrap/$BOOTSTRAP_VERSION/
cp node_modules/bootstrap/dist/js/bootstrap.bundle.min.js* source/js/bootstrap/$BOOTSTRAP_VERSION/
cp node_modules/bootstrap/dist/css/bootstrap.min.css* source/css/bootstrap/$BOOTSTRAP_VERSION/
