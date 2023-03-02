syft . -o json > www-sbom.json
grype sbom:./www-sbom.json > vulnerabilities.txt
git diff ./vulnerabilities.txt

