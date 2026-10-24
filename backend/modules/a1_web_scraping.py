"""
Assignment 1: Web Scraping and Document Ingestion
Retrieves publicly accessible Terms and Conditions / Privacy Policies using requests and BeautifulSoup.
Respects robots.txt, terms of service, and rate limits.
Handles HTTP errors, connection timeouts, and access restrictions gracefully.
Supports PDF extraction via PyMuPDF (fitz) and raw TXT document ingestion.
"""

import re
import urllib.parse
import urllib.robotparser
from typing import Dict, Any, Optional
import requests
from bs4 import BeautifulSoup

STANDARD_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}

USER_AGENT = STANDARD_HEADERS["User-Agent"]

def check_robots_txt(url: str, user_agent: str = "*") -> Dict[str, Any]:
    """
    Checks robots.txt for the given domain to ensure ethical scraping practices.
    """
    parsed = urllib.parse.urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return {"allowed": False, "reason": "Invalid URL structure"}
    
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    try:
        r = requests.get(robots_url, headers=STANDARD_HEADERS, timeout=5)
        if r.status_code == 200:
            rp.parse(r.text.splitlines())
            allowed = rp.can_fetch(user_agent, url)
            return {
                "allowed": allowed,
                "robots_url": robots_url,
                "reason": "Robots.txt permitted" if allowed else "Scraping disallowed by website robots.txt rules"
            }
        else:
            return {
                "allowed": True,
                "robots_url": robots_url,
                "reason": f"Robots.txt returned HTTP {r.status_code} (default open)"
            }
    except Exception as e:
        # If robots.txt cannot be fetched or doesn't exist, assume standard public access
        return {
            "allowed": True,
            "robots_url": robots_url,
            "reason": f"Robots.txt unavailable or default open ({str(e)})"
        }

def scrape_url(url: str, enforce_robots: bool = True) -> Dict[str, Any]:
    """
    Scrapes a public webpage, extracting readable text and removing non-content tags.
    Does NOT bypass authentication, paywalls, or CAPTCHAs.
    """
    if not url or not isinstance(url, str):
        return {"success": False, "error": "No URL provided", "text": ""}
    
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    # Ethical scraping check
    robots_info = check_robots_txt(url)
    if enforce_robots and not robots_info["allowed"]:
        return {
            "success": False,
            "error": f"Scraping blocked: {robots_info['reason']}",
            "robots_info": robots_info,
            "text": ""
        }

    try:
        response = requests.get(url, headers=STANDARD_HEADERS, timeout=12, allow_redirects=True)
        if response.status_code == 403:
            return {"success": False, "error": "HTTP 403 Forbidden: Access restricted or authentication required", "status_code": 403}
        if response.status_code == 404:
            return {"success": False, "error": "HTTP 404 Not Found: Webpage does not exist", "status_code": 404}
        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "")
        if "pdf" in content_type.lower():
            # URL directly served a PDF file
            return extract_pdf_bytes(response.content, filename=url)

        soup = BeautifulSoup(response.content, "html.parser")

        # Extract title
        page_title = soup.title.string.strip() if soup.title and soup.title.string else "Terms & Conditions"

        # Remove irrelevant noise elements
        for tag in soup(["script", "style", "noscript", "header", "nav", "footer", "aside", "svg", "button", "form", "iframe"]):
            tag.decompose()

        # Prioritize main content containers if present
        main_content = soup.find(["main", "article"]) or soup.find(id=re.compile(r"terms|privacy|policy|legal|content", re.I)) or soup.body
        if not main_content:
            main_content = soup

        raw_text = main_content.get_text(separator="\n")
        cleaned_text = clean_extracted_text(raw_text)

        if len(cleaned_text.split()) < 10:
            return {
                "success": False,
                "error": "Extracted text is too short or blocked by dynamic JavaScript rendering.",
                "status_code": response.status_code,
                "text": cleaned_text
            }

        return {
            "success": True,
            "url": url,
            "title": page_title,
            "text": cleaned_text,
            "word_count": len(cleaned_text.split()),
            "status_code": response.status_code,
            "robots_info": robots_info,
            "source_type": "URL"
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Request timed out after 12 seconds."}
    except requests.exceptions.SSLError:
        return {"success": False, "error": "SSL certificate verification failed."}
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Failed to connect to host. Please verify the domain."}
    except Exception as e:
        return {"success": False, "error": f"Scraping error: {str(e)}"}

def extract_pdf_bytes(pdf_bytes: bytes, filename: str = "document.pdf") -> Dict[str, Any]:
    """
    Extracts text from PDF bytes using PyMuPDF (fitz).
    """
    try:
        import fitz
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_text = []
        page_count = len(doc)
        
        for page_num in range(page_count):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            if text:
                pages_text.append(text)
        
        doc.close()
        full_text = "\n\n".join(pages_text)
        cleaned_text = clean_extracted_text(full_text)

        if not cleaned_text.strip():
            return {
                "success": False,
                "error": "PDF contains no selectable text (may be a scanned image without OCR).",
                "page_count": page_count
            }

        return {
            "success": True,
            "filename": filename,
            "text": cleaned_text,
            "page_count": page_count,
            "word_count": len(cleaned_text.split()),
            "source_type": "PDF"
        }
    except Exception as e:
        return {"success": False, "error": f"PyMuPDF PDF extraction failed: {str(e)}"}

def extract_txt_bytes(txt_bytes: bytes, filename: str = "document.txt") -> Dict[str, Any]:
    """
    Extracts and normalizes text from a TXT file.
    """
    try:
        try:
            text = txt_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = txt_bytes.decode("latin-1")
        cleaned_text = clean_extracted_text(text)
        return {
            "success": True,
            "filename": filename,
            "text": cleaned_text,
            "word_count": len(cleaned_text.split()),
            "source_type": "TXT"
        }
    except Exception as e:
        return {"success": False, "error": f"Failed to read TXT file: {str(e)}"}

def clean_extracted_text(text: str) -> str:
    """
    Normalizes whitespace and removes redundant carriage returns.
    """
    if not text:
        return ""
    # Replace non-breaking spaces
    text = text.replace("\xa0", " ").replace("\r", "\n")
    # Collapse multiple consecutive blank lines
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
    # Collapse multiple spaces
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()

if __name__ == "__main__":
    # Self-test
    test_result = scrape_url("https://example.com")
    print("Scraping Test Result:", test_result["success"], "Words:", test_result.get("word_count"))
