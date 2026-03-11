#!/usr/bin/env python3
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
PDF_PATH = ROOT / "assets" / "uploads" / "hero-quotes.pdf"
OUTPUT_PATH = ROOT / "_data" / "hero_quotes.json"


def normalize_line(line: str) -> str:
    return " ".join((line or "").split()).strip()


def extract_quotes(raw_text: str) -> list[str]:
    seen = set()
    quotes = []

    for raw_line in (raw_text or "").splitlines():
        line = normalize_line(raw_line)
        if not line:
            continue

        key = line.lower()
        if key in seen:
            continue

        seen.add(key)
        quotes.append(line)

    return quotes


def read_pdf_text_with_pypdf(pdf_path: Path) -> str:
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception:
        return ""

    reader = PdfReader(str(pdf_path))
    chunks = []
    for page in reader.pages:
        chunks.append(page.extract_text() or "")
    return "\n".join(chunks)


def read_pdf_text_with_pdftotext(pdf_path: Path) -> str:
    try:
        result = subprocess.run(
            ["pdftotext", "-layout", "-nopgbrk", str(pdf_path), "-"],
            capture_output=True,
            text=True,
            check=False,
        )
    except FileNotFoundError:
        return ""

    if result.returncode != 0:
        return ""

    return result.stdout or ""


def write_output(quotes: list[str], source_found: bool) -> None:
    payload = {
        "source_pdf": "assets/uploads/hero-quotes.pdf",
        "source_found": source_found,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "quotes": quotes,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    if not PDF_PATH.exists():
        write_output([], False)
        print("No hero quote PDF found. Wrote empty _data/hero_quotes.json.")
        return 0

    raw_text = read_pdf_text_with_pypdf(PDF_PATH)
    if not raw_text:
        raw_text = read_pdf_text_with_pdftotext(PDF_PATH)

    if not raw_text:
        write_output([], True)
        print("Could not extract text from hero quote PDF. Wrote empty quote list.")
        return 0

    quotes = extract_quotes(raw_text)
    write_output(quotes, True)
    print(f"Generated {len(quotes)} hero quotes from assets/uploads/hero-quotes.pdf.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
