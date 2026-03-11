#!/usr/bin/env python3
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
UPLOADS_DIR = ROOT / "assets" / "uploads"
QUOTES_UPLOADS_DIR = UPLOADS_DIR / "quotes"
PRIMARY_PDF_PATH = QUOTES_UPLOADS_DIR / "hero-quotes.pdf"
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


def resolve_pdf_path() -> Path | None:
    if PRIMARY_PDF_PATH.exists():
        return PRIMARY_PDF_PATH

    # Backward-compatibility: older location before quotes subfolder was introduced.
    legacy_primary_pdf = UPLOADS_DIR / "hero-quotes.pdf"
    if legacy_primary_pdf.exists():
        return legacy_primary_pdf

    if not UPLOADS_DIR.exists():
        return None

    # Common alternate names from CMS/manual uploads.
    preferred_variants = ["hero_quotes.pdf", "Hero-Quotes.pdf", "Hero_Quotes.pdf"]
    candidate_dirs = [folder for folder in [QUOTES_UPLOADS_DIR, UPLOADS_DIR] if folder.exists()]
    all_pdfs = []
    for folder in candidate_dirs:
        all_pdfs.extend(
            sorted(path for path in folder.iterdir() if path.is_file() and path.suffix.lower() == ".pdf")
        )

    for variant in preferred_variants:
        for folder in candidate_dirs:
            candidate = folder / variant
            if candidate in all_pdfs:
                return candidate

    if len(all_pdfs) == 1:
        return all_pdfs[0]

    return None


def write_output(quotes: list[str], source_found: bool, source_pdf: str = "assets/uploads/quotes/hero-quotes.pdf") -> None:
    payload = {
        "source_pdf": source_pdf,
        "source_found": source_found,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "quotes": quotes,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    pdf_path = resolve_pdf_path()

    if not pdf_path:
        write_output([], False)
        print(
            "No quote PDF found. Add assets/uploads/quotes/hero-quotes.pdf "
            "(or a single PDF in assets/uploads/quotes) and rerun."
        )
        return 0

    source_pdf = str(pdf_path.relative_to(ROOT)).replace("\\", "/")

    raw_text = read_pdf_text_with_pypdf(pdf_path)
    if not raw_text:
        raw_text = read_pdf_text_with_pdftotext(pdf_path)

    if not raw_text:
        write_output([], True, source_pdf)
        print(
            f"Found {source_pdf} but could not extract text. "
            "Install pypdf or pdftotext in your environment and rerun."
        )
        return 0

    quotes = extract_quotes(raw_text)
    write_output(quotes, True, source_pdf)
    print(f"Generated {len(quotes)} hero quotes from {source_pdf}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
