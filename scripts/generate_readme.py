#!/usr/bin/env python3
"""Generate README.md from catalog.yml.

Single source of truth is catalog.yml. This script validates it and renders
README.md between the AUTOGEN markers. Run with --check in CI to fail when the
committed README is stale.

Usage:
    python3 scripts/generate_readme.py            # write README.md
    python3 scripts/generate_readme.py --check    # exit 1 if README is stale
"""
import argparse
import pathlib
import re
import sys

try:
    import yaml
except ImportError:
    sys.exit("PyYAML is required: pip install pyyaml")

ROOT = pathlib.Path(__file__).resolve().parent.parent
CATALOG = ROOT / "catalog.yml"
README = ROOT / "README.md"

START = "<!-- AUTOGEN:START - do not edit below; edit catalog.yml instead -->"
END = "<!-- AUTOGEN:END -->"

VALID_STATUS = {"mainline", "archived"}


def fail(msg):
    sys.exit(f"catalog.yml validation error: {msg}")


def load():
    with CATALOG.open() as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        fail("top level must be a mapping with 'services' and 'entries'")
    services = data.get("services") or {}
    entries = data.get("entries") or []
    if not services:
        fail("no 'services' defined")
    if not entries:
        fail("no 'entries' defined")
    return services, entries


def validate(services, entries):
    seen_titles = set()
    for i, e in enumerate(entries):
        where = f"entry #{i + 1}"
        for field in ("title", "service", "status", "url", "desc"):
            if not e.get(field):
                fail(f"{where} missing required field '{field}'")
        title = e["title"]
        if title in seen_titles:
            fail(f"duplicate title: {title!r}")
        seen_titles.add(title)
        if e["service"] not in services:
            fail(f"{where} ({title!r}) has unknown service {e['service']!r}; "
                 f"valid: {', '.join(sorted(services))}")
        if e["status"] not in VALID_STATUS:
            fail(f"{where} ({title!r}) has invalid status {e['status']!r}; "
                 f"valid: {', '.join(sorted(VALID_STATUS))}")
        # Allow absolute http(s) links or in-repo relative links into legacy/
        # (preserved monorepo write-ups) or examples/ (current reference data).
        if not re.match(r"^(https?://|legacy/|examples/)", e["url"]):
            fail(f"{where} ({title!r}) url must start with http(s):// "
                 f"or be a relative legacy/ or examples/ path")
        tags = e.get("tags") or []
        if not isinstance(tags, list):
            fail(f"{where} ({title!r}) tags must be a list")
        for t in tags:
            if not isinstance(t, str) or t != t.lower():
                fail(f"{where} ({title!r}) tag {t!r} must be a lowercase string")


def fmt_tags(tags):
    return " ".join(f"`{t}`" for t in (tags or [])) or "-"


def render(services, entries):
    lines = []
    a = lines.append

    total = len(entries)
    mainline = sum(1 for e in entries if e["status"] == "mainline")
    archived = total - mainline

    # Service order: by `order` then label
    ordered = sorted(services.items(), key=lambda kv: (kv[1].get("order", 50), kv[1]["label"]))

    # ---- Summary + how to filter -------------------------------------------
    a(f"**{total} reference architectures** &bull; {mainline} mainline &bull; {archived} archived\n")
    a("> **Filter:** use your browser find (`Ctrl/Cmd-F`) on a tag like `genai` or `whatsapp`, "
      "or jump to a section below. Every tag in the catalog is listed in the "
      "[Tag index](#tag-index).\n")

    # ---- Table of contents -------------------------------------------------
    a("### Contents\n")
    for key, meta in ordered:
        count = sum(1 for e in entries if e["service"] == key)
        if count:
            anchor = meta["label"].lower()
            anchor = re.sub(r"[^a-z0-9 -]", "", anchor).replace(" ", "-")
            a(f"- [{meta['label']}](#{anchor}) ({count})")
    a("- [Tag index](#tag-index)")
    a("- [Add a new entry](#add-a-new-entry)\n")

    # ---- Sections per service ----------------------------------------------
    for key, meta in ordered:
        group = [e for e in entries if e["service"] == key]
        if not group:
            continue
        a(f"## {meta['label']}\n")
        blurb = (meta.get("blurb") or "").strip()
        if blurb:
            a(f"{blurb}\n")
        a("| Sample | Tags | Description |")
        a("|--------|------|-------------|")
        for e in sorted(group, key=lambda x: x["title"].lower()):
            name = f"[{e['title']}]({e['url']})"
            if e["status"] == "archived":
                name += " &nbsp;`archived`"
            desc = e["desc"].strip().replace("|", "\\|")
            a(f"| {name} | {fmt_tags(e.get('tags'))} | {desc} |")
        a("")

    # ---- Tag index ---------------------------------------------------------
    a("## Tag index\n")
    tag_map = {}
    for e in entries:
        for t in (e.get("tags") or []):
            tag_map.setdefault(t, 0)
            tag_map[t] += 1
    if tag_map:
        a("Search (`Ctrl/Cmd-F`) any tag to find matching samples.\n")
        a(" ".join(f"`{t}` ({n})" for t, n in sorted(tag_map.items())))
        a("")
    else:
        a("_No tags yet._\n")

    # ---- Contribution guide ------------------------------------------------
    a("## Add a new entry\n")
    a("Open an issue with the sample's URL, its service, and a one-line "
      "description, and a maintainer adds it. Or add it yourself in "
      "[`catalog.yml`](catalog.yml) and open a pull request (do not edit the "
      "table above by hand, it is generated). See "
      "[CONTRIBUTING.md](CONTRIBUTING.md) for details. Works for anything "
      "public: an `aws-samples` repo, another GitHub org, a blog, or a "
      "workshop.\n")

    return "\n".join(lines).rstrip() + "\n"


def wrap(body):
    header = (
        "# CDS Reference Architectures\n\n"
        "Index of communication and messaging reference architectures from the "
        "AWS Communication Developer Services (CDS) team, focused on **AWS End "
        "User Messaging** and **Amazon SES**. Amazon Pinpoint patterns are kept "
        "for reference but archived.\n\n"
        "The catalog below links every End User Messaging, SES, and (legacy) "
        "Pinpoint sample the CDS team publishes, whether it lives in its own "
        "`aws-samples` repo, elsewhere public, or in this repo's original "
        "monorepo source.\n\n"
        "- Original monorepo source (CloudFormation templates, Lambda code, "
        "examples) and the detailed write-ups with architecture diagrams are "
        "preserved under [`legacy/`](legacy/) (see "
        "[`legacy/LEGACY_README.md`](legacy/LEGACY_README.md)). Entries for "
        "those patterns link straight to their write-up.\n\n"
    )
    return f"{header}{START}\n{body}\n{END}\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="exit non-zero if README.md is out of date")
    args = ap.parse_args()

    services, entries = load()
    validate(services, entries)
    content = wrap(render(services, entries))

    if args.check:
        current = README.read_text() if README.exists() else ""
        if current != content:
            sys.exit("README.md is out of date. Run: python3 scripts/generate_readme.py")
        print("README.md is up to date.")
        return

    README.write_text(content)
    print(f"Wrote {README.relative_to(ROOT)} "
          f"({len(entries)} entries, {len(services)} services).")


if __name__ == "__main__":
    main()
