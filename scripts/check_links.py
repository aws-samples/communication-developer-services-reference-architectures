#!/usr/bin/env python3
"""Check every catalog.yml URL for rot.

Three kinds of URL live in the catalog:

  http(s)://...              external links (mostly aws-samples GitHub repos)
  legacy/path/to/file        a file shipped in this repo
  legacy/FILE.md#anchor       a heading anchor inside a repo markdown file

For each we verify the target actually resolves:
  - http links: an HTTP request that follows redirects; report the status
  - local files: the (URL-decoded) path exists on disk
  - anchors: the file exists AND a matching GitHub-style heading slug is present

Exit code is non-zero if anything is broken, so this can gate CI.

No GitHub token or network auth is needed: these are plain public-web
requests, not GitHub API calls, so the 60-req/hr API limit does not apply.
"""

import concurrent.futures as futures
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
CATALOG = REPO_ROOT / "catalog.yml"

# A browser-ish UA; some hosts 403 the default urllib agent.
UA = "Mozilla/5.0 (cds-reference-architectures link-checker)"
TIMEOUT = 20
MAX_WORKERS = 8


def slugify(heading: str) -> str:
    """GitHub-flavored heading -> anchor slug.

    Mirrors github-slugger: lowercase, strip punctuation (keeping word chars,
    spaces and hyphens), then map each space to a hyphen *without collapsing
    runs*. So "Add / Remove" -> "add--remove" (the slash is dropped, leaving
    two spaces -> two hyphens).
    """
    s = heading.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)  # drop punctuation
    s = s.replace(" ", "-")         # per-space, not \s+ collapse
    return s


def anchors_in_markdown(md_path: Path) -> set[str]:
    anchors: set[str] = set()
    for line in md_path.read_text(encoding="utf-8", errors="replace").splitlines():
        m = re.match(r"^#{1,6}\s+(.*)$", line)
        if m:
            anchors.add(slugify(m.group(1)))
    return anchors


def check_http(url: str) -> tuple[str, str, str | None]:
    """Return (status, detail, resolved_url). status in {ok, broken, warn}.

    resolved_url is the redirect target when the URL moved (so a caller can
    auto-fix a renamed repo), else None.
    """
    req = urllib.request.Request(url, method="GET", headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            code = resp.getcode()
            final = resp.geturl()
            if code == 200:
                if final.rstrip("/") != url.rstrip("/"):
                    return "warn", f"200 (redirected -> {final})", final
                return "ok", "200", None
            return "warn", f"{code}", None
    except urllib.error.HTTPError as e:
        return "broken", f"HTTP {e.code}", None
    except (urllib.error.URLError, TimeoutError) as e:
        return "broken", f"{type(e).__name__}: {e}", None
    except Exception as e:  # noqa: BLE001 - report anything odd rather than crash
        return "broken", f"{type(e).__name__}: {e}", None


def check_local(url: str) -> tuple[str, str, str | None]:
    path_part, _, anchor = url.partition("#")
    decoded = urllib.parse.unquote(path_part)
    target = (REPO_ROOT / decoded).resolve()

    # Guard against paths escaping the repo.
    if REPO_ROOT not in target.parents and target != REPO_ROOT:
        return "broken", f"path escapes repo: {decoded}", None
    if not target.exists():
        return "broken", f"missing file: {decoded}", None
    if anchor:
        if target.suffix.lower() not in {".md", ".markdown"}:
            return "warn", f"anchor #{anchor} on non-markdown file", None
        if slugify(anchor) not in anchors_in_markdown(target):
            return "broken", f"missing anchor #{anchor} in {decoded}", None
    return "ok", f"{decoded}" + (f"#{anchor}" if anchor else ""), None


def check(entry: dict) -> dict:
    url = entry["url"]
    if url.startswith("http://") or url.startswith("https://"):
        status, detail, resolved = check_http(url)
    else:
        status, detail, resolved = check_local(url)
    return {
        "status": status,
        "title": entry["title"],
        "url": url,
        "detail": detail,
        "resolved": resolved,
    }


def apply_redirect_fixes(results: list[dict]) -> int:
    """Rewrite catalog.yml, replacing moved URLs with their redirect targets.

    Only touches entries whose check produced a `resolved` URL (i.e. a real
    redirect). Edits the raw text so formatting/comments survive, rather than
    round-tripping through yaml.dump. Returns the number of URLs rewritten.
    """
    fixes = {r["url"]: r["resolved"] for r in results if r.get("resolved")}
    if not fixes:
        print("no redirect fixes to apply.")
        return 0
    text = CATALOG.read_text()
    applied = 0
    for old, new in fixes.items():
        # Match the url value however it's quoted, anchored to the `url:` key.
        pattern = re.compile(
            r'(\burl:\s*["\']?)' + re.escape(old) + r'(["\']?\s*(?:#.*)?$)',
            re.MULTILINE,
        )
        text, n = pattern.subn(rf'\g<1>{new}\g<2>', text)
        if n:
            applied += n
            print(f"  {old}\n    -> {new}  ({n})")
    if applied:
        CATALOG.write_text(text)
        print(f"\nrewrote {applied} URL(s) in {CATALOG.relative_to(REPO_ROOT)}. "
              f"Review the diff and re-run the README generator.")
    return applied


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true",
                        help="emit machine-readable JSON (for CI)")
    parser.add_argument("--fix", action="store_true",
                        help="rewrite catalog.yml, replacing moved URLs with "
                             "their redirect targets (review the diff after)")
    args = parser.parse_args()

    catalog = yaml.safe_load(CATALOG.read_text())
    entries = catalog["entries"]

    results: list[dict] = []
    http_entries = [e for e in entries if e["url"].startswith("http")]
    local_entries = [e for e in entries if not e["url"].startswith("http")]

    # Local checks are instant; run inline. HTTP checks are network-bound; parallelize.
    for e in local_entries:
        results.append(check(e))
    with futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        results.extend(pool.map(check, http_entries))

    order = {"broken": 0, "warn": 1, "ok": 2}
    results.sort(key=lambda r: (order[r["status"]], r["title"].lower()))

    broken = [r for r in results if r["status"] == "broken"]
    warn = [r for r in results if r["status"] == "warn"]
    ok = [r for r in results if r["status"] == "ok"]

    if args.json:
        import json
        print(json.dumps({
            "total": len(results),
            "ok": len(ok),
            "warnings": len(warn),
            "broken": len(broken),
            "results": results,
        }, indent=2))
    else:
        icon = {"ok": "OK  ", "warn": "WARN", "broken": "FAIL"}
        for r in results:
            print(f"{icon[r['status']]}  {r['title']}\n"
                  f"        {r['url']}\n        -> {r['detail']}")
        print()
        print(f"checked {len(results)} entries: "
              f"{len(ok)} ok, {len(warn)} warnings, {len(broken)} broken")

    if args.fix:
        print("\napplying redirect fixes...")
        apply_redirect_fixes(results)

    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
