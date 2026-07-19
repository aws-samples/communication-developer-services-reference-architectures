#!/usr/bin/env python3
"""Fetch GitHub metadata for every external repo in catalog.yml.

For each distinct github.com/<owner>/<repo> URL in the catalog, pull:
  - created_at   ("date uploaded")
  - pushed_at    (last commit -- the staleness signal that actually matters)
  - archived     (upstream has archived the repo)
  - stargazers   (rough popularity)

Results are written to scripts/metadata.json, keyed by "owner/repo", so the
README generator (or a human) can surface a "Last updated" column and flag any
entry we list as `mainline` that GitHub has since archived.

    python3 scripts/fetch_metadata.py            # write scripts/metadata.json
    python3 scripts/fetch_metadata.py --check     # compare vs catalog, exit 1 on drift

Auth: set GITHUB_TOKEN to raise the API limit from 60/hr (unauthenticated,
enough for ~55 repos but fragile) to 5000/hr. The token needs no scopes for
public repos. Without it the script still runs and just warns on rate limits.
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "catalog.yml"
OUT = Path(__file__).resolve().parent / "metadata.json"

API = "https://api.github.com/repos/"
UA = "cds-reference-architectures metadata-sweep"


def distinct_repos(entries: list[dict]) -> dict[str, list[str]]:
    """Map "owner/repo" -> list of catalog titles pointing at it."""
    repos: dict[str, list[str]] = {}
    for e in entries:
        m = re.match(r"https?://github\.com/([^/]+/[^/#?]+)", e["url"])
        if not m:
            continue
        slug = m.group(1).removesuffix(".git")
        repos.setdefault(slug, []).append(e["title"])
    return repos


def fetch(slug: str, token: str | None) -> dict:
    req = urllib.request.Request(API + slug, headers={"User-Agent": UA,
                                                      "Accept": "application/vnd.github+json"})
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            d = json.load(resp)
        return {
            "created_at": d.get("created_at"),
            "pushed_at": d.get("pushed_at"),
            "archived": d.get("archived", False),
            "stars": d.get("stargazers_count", 0),
            "error": None,
        }
    except urllib.error.HTTPError as e:
        if e.code == 403 and "rate limit" in str(e.headers.get("X-RateLimit-Remaining", "")):
            return {"error": "rate-limited (set GITHUB_TOKEN)"}
        if e.code == 403:
            return {"error": "rate-limited or forbidden (set GITHUB_TOKEN)"}
        if e.code == 404:
            return {"error": "404 not found (repo deleted or renamed)"}
        return {"error": f"HTTP {e.code}"}
    except Exception as e:  # noqa: BLE001
        return {"error": f"{type(e).__name__}: {e}"}


def main() -> int:
    check = "--check" in sys.argv
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")

    catalog = yaml.safe_load(CATALOG.read_text())
    repos = distinct_repos(catalog["entries"])
    if not token:
        print(f"note: no GITHUB_TOKEN set; {len(repos)} repos unauthenticated "
              f"(60/hr limit).", file=sys.stderr)

    meta: dict[str, dict] = {}
    errors = 0
    for slug in sorted(repos):
        info = fetch(slug, token)
        info["titles"] = repos[slug]
        meta[slug] = info
        if info.get("error"):
            errors += 1
            print(f"ERR   {slug}: {info['error']}")
        else:
            flag = "  ARCHIVED-UPSTREAM" if info["archived"] else ""
            print(f"ok    {slug}  pushed {info['pushed_at']}{flag}")

    # Drift check: catalog says mainline, but GitHub has archived it upstream.
    status_by_title = {e["title"]: e.get("status") for e in catalog["entries"]}
    drift = []
    for slug, info in meta.items():
        if info.get("archived"):
            for title in info["titles"]:
                if status_by_title.get(title) == "mainline":
                    drift.append((title, slug))
    if drift:
        print("\nDRIFT: entries marked `mainline` but archived upstream:")
        for title, slug in drift:
            print(f"  - {title}  ({slug})")

    if check:
        if drift:
            return 1
        print("\nno mainline/archived drift.")
        return 0

    OUT.write_text(json.dumps(meta, indent=2, sort_keys=True) + "\n")
    print(f"\nwrote {OUT.relative_to(ROOT)}: {len(meta)} repos, {errors} errors.")
    return 1 if errors and not any(m.get("pushed_at") for m in meta.values()) else 0


if __name__ == "__main__":
    sys.exit(main())
