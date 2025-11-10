syft . -o json > www-sbom.json
TMPDIR=~/Library/Caches/grype/db/ grype sbom:./www-sbom.json > vulnerabilities.txt
git diff ./vulnerabilities.txt

