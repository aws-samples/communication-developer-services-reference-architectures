# Contributing

This repo is an index of AWS End User Messaging, Amazon SES, and legacy Amazon
Pinpoint samples. The goal is that every relevant sample is captured here as a
reference link, organized so it is easy to find.

## Suggest a sample

Open an issue with the sample's URL, which service it relates to
(EUM, SES, MULTI, or PINPOINT), and a one-line description. A maintainer adds
it to the catalog. This works for anything public: an `aws-samples` repo,
another GitHub org, a blog post, or a workshop.

## Add an entry yourself

The catalog lives in [`catalog.yml`](catalog.yml). The table in `README.md` is
generated from it, so do not edit the README table by hand.

1. Add an entry block to `catalog.yml` (template is at the top of the file):

   ```yaml
     - title: Short human-readable name
       service: EUM            # EUM | SES | MULTI | PINPOINT
       status: mainline        # mainline | archived
       tags: [genai, whatsapp] # lowercase, reuse existing tags where you can
       url: https://github.com/aws-samples/your-repo
       desc: One sentence describing what it does
   ```

2. Regenerate the README:

   ```bash
   pip install pyyaml        # once
   python3 scripts/generate_readme.py
   ```

3. Commit both `catalog.yml` and `README.md` and open a pull request.

### Conventions

- `service`: `EUM` and `SES` are the actively maintained services. `MULTI` is
  for samples that span channels. `PINPOINT` is legacy.
- `status`: `mainline` for current EUM/SES work; `archived` for Pinpoint or any
  repo that is archived or no longer recommended.
- `tags`: lowercase, free-form. Reuse an existing tag from the README Tag index
  before inventing a new one.
- `desc`: one sentence, no trailing period.
- `url`: the real live repo, or an in-repo `legacy/` path for the original
  monorepo patterns (e.g. `legacy/LEGACY_README.md#ses-auto-reply`).

## Code of Conduct

This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct).
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact
opensource-codeofconduct@amazon.com with any questions or comments.

## Security issue notifications

If you discover a potential security issue, notify AWS/Amazon Security via the
[vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/).
Do **not** create a public issue.

## Licensing

See the [LICENSE](LICENSE) file. We may ask you to confirm the licensing of your
contribution and, for larger changes, to sign a
[Contributor License Agreement (CLA)](http://en.wikipedia.org/wiki/Contributor_License_Agreement).
