syft . -o json > profiles-sbom.json
grype sbom:./profiles-sbom.json > vulnerabilities.txt

