# GrammarSoft ApS Proofing Tools WebExtension

Initially developed for use with the https://kommaer.dk/ and https://retmig.dk/ services.

Released as GPLv3+, with exception of the images/ folder as that contains proprietary branding.

## Known Issues

### Google Docs
* If a paragraph has multiple spaces in a row and is using justified alignment, there is no way to detect these multiple spaces and they will cause manipulation errors. A possible workaround is to inject a `<span>` around the first letter of the target word.
