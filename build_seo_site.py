"""Build crawlable static SEO pages from the MarwarMade article source.

Run: python build_seo_site.py

This generator deliberately uses only the Python standard library so the
published pages can be rebuilt without a Node or framework dependency.
"""

from __future__ import annotations

from datetime import datetime
from html import escape
from json import dumps, loads
from os.path import relpath
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SITE_URL = "https://marwarmade.com"


class JavaScriptLiteralParser:
    """Parse the limited JS object-literal format used in articles.js."""

    def __init__(self, source: str, position: int) -> None:
        self.source = source
        self.position = position

    def skip_space(self) -> None:
        while self.position < len(self.source) and self.source[self.position].isspace():
            self.position += 1

    def expect(self, character: str) -> None:
        self.skip_space()
        if self.source[self.position : self.position + 1] != character:
            raise ValueError(f"Expected {character!r} at {self.position}")
        self.position += 1

    def string(self) -> str:
        self.skip_space()
        start = self.position
        quote = self.source[self.position]
        if quote not in {"'", '"'}:
            raise ValueError(f"Expected string at {self.position}")
        self.position += 1
        escaped = False
        while self.position < len(self.source):
            character = self.source[self.position]
            self.position += 1
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == quote:
                raw = self.source[start : self.position]
                if quote == "'":
                    raw = '"' + raw[1:-1].replace('"', '\\"') + '"'
                return loads(raw)
        raise ValueError("Unterminated string")

    def identifier(self) -> str:
        self.skip_space()
        start = self.position
        while self.position < len(self.source) and (
            self.source[self.position].isalnum() or self.source[self.position] in "_$-"
        ):
            self.position += 1
        if start == self.position:
            raise ValueError(f"Expected identifier at {self.position}")
        return self.source[start : self.position]

    def value(self):
        self.skip_space()
        character = self.source[self.position]
        if character in {"'", '"'}:
            return self.string()
        if character == "[":
            return self.array()
        if character == "{":
            return self.object()
        value = self.identifier()
        if value == "true":
            return True
        if value == "false":
            return False
        if value == "null":
            return None
        raise ValueError(f"Unsupported value {value!r}")

    def array(self) -> list:
        self.expect("[")
        values = []
        self.skip_space()
        while self.source[self.position] != "]":
            values.append(self.value())
            self.skip_space()
            if self.source[self.position] == ",":
                self.position += 1
                self.skip_space()
            elif self.source[self.position] != "]":
                raise ValueError(f"Expected comma or ] at {self.position}")
        self.position += 1
        return values

    def object(self) -> dict:
        self.expect("{")
        result = {}
        self.skip_space()
        while self.source[self.position] != "}":
            key = self.string() if self.source[self.position] in {"'", '"'} else self.identifier()
            self.expect(":")
            result[key] = self.value()
            self.skip_space()
            if self.source[self.position] == ",":
                self.position += 1
                self.skip_space()
            elif self.source[self.position] != "}":
                raise ValueError(f"Expected comma or }} at {self.position}")
        self.position += 1
        return result


def load_posts() -> list[dict]:
    source = (ROOT / "articles.js").read_text(encoding="utf-8")
    marker = "export const posts ="
    start = source.index("[", source.index(marker))
    return JavaScriptLiteralParser(source, start).value()


def text(value: str) -> str:
    return escape(str(value), quote=True)


def date_iso(value: str) -> str:
    return datetime.strptime(value, "%B %d, %Y").date().isoformat()


def local_href(current_file: Path, target_file: Path) -> str:
    return relpath(target_file, current_file.parent).replace("\\", "/")


def page_head(title: str, description: str, canonical: str, page_type: str, current_file: Path, schema: dict | None = None) -> str:
    schema_markup = ""
    if schema:
        schema_markup = f'<script type="application/ld+json">{dumps(schema, ensure_ascii=False)}</script>'
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{text(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="{text(canonical)}">
  <meta property="og:type" content="{text(page_type)}">
  <meta property="og:title" content="{text(title)}">
  <meta property="og:description" content="{text(description)}">
  <meta property="og:url" content="{text(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{text(title)}">
  <meta name="twitter:description" content="{text(description)}">
  <title>{text(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{local_href(current_file, ROOT / 'global.css')}">
  {schema_markup}
</head>"""


def header(current_file: Path) -> str:
    home = local_href(current_file, ROOT / "index.html")
    wall_decor = local_href(current_file, ROOT / "collections" / "wall-decor" / "index.html")
    wooden_accents = local_href(current_file, ROOT / "collections" / "wooden-accents" / "index.html")
    furniture = local_href(current_file, ROOT / "collections" / "wooden-furniture" / "index.html")
    return f"""<body>
  <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="{home}" aria-label="MarwarMade home"><span class="brand-mark">MM</span><span>MARWAR<span>MADE</span></span></a>
      <nav class="primary-nav" aria-label="Primary navigation">
        <a href="{home}">Journal</a>
        <a href="{wall_decor}">Wall decor</a>
        <a href="{wooden_accents}">Wooden accents</a>
        <a href="{furniture}">Furniture</a>
      </nav>
      <a class="shop-link" href="https://marwarmade.com">Visit shop <span aria-hidden="true">↗</span></a>
    </header>"""


def footer() -> str:
    return """    <footer class="site-footer">
      <a class="brand footer-brand" href="/" aria-label="MarwarMade home"><span class="brand-mark">MM</span><span>MARWAR<span>MADE</span></span></a>
      <p>Homes with warmth, craft and a sense of place.</p>
      <p class="footer-note">© 2026 MarwarMade.</p>
    </footer>
  </div>
</body>
</html>"""


def article_path(post: dict) -> str:
    return f"/blog/{post['slug']}/"


def story_row(post: dict, current_file: Path) -> str:
    return f"""<li>
  <a class="story-row" href="{local_href(current_file, ROOT / 'blog' / post['slug'] / 'index.html')}">
    <span class="story-no">{text(post['number'])}</span>
    <span class="story-main">
      <span class="story-meta">{text(post['category'])} · {text(post['readTime'])}</span>
      <span class="story-title">{text(post['title'])}</span>
      <span class="story-excerpt">{text(post['excerpt'])}</span>
    </span>
    <span class="read-story" aria-hidden="true">↗</span>
  </a>
</li>"""


def image_placeholder(description: str, index: int, hero: bool = False) -> str:
    modifier = " image-placeholder--hero" if hero else ""
    return f"""<figure class="image-placeholder{modifier}">
  <div class="image-placeholder__number">IMAGE {index:02}</div>
  <div class="image-placeholder__content"><span>Photo to be added</span><figcaption>{text(description)}</figcaption></div>
</figure>"""


def home_page(posts: list[dict]) -> str:
    output_file = ROOT / "index.html"
    canonical = f"{SITE_URL}/"
    title = "MarwarMade | Hand-Carved Wooden Decor Journal"
    description = "Discover hand-carved wooden wall decor, wooden furniture and practical buying guides from MarwarMade."
    topics = [
        ("Wooden Wall Decor", "/collections/wall-decor/"),
        ("Wooden Accents", "/collections/wooden-accents/"),
        ("Wooden Furniture", "/collections/wooden-furniture/"),
    ]
    rows = "\n".join(story_row(post, output_file) for post in posts)
    chips = "\n".join(f'<a class="topic-chip" href="{local_href(output_file, ROOT / url.strip("/") / "index.html")}">{label}</a>' for label, url in topics)
    return page_head(title, description, canonical, "website", output_file) + header(output_file) + f"""
    <main>
      <section class="journal-hero"><div><p class="eyebrow">MarwarMade wooden decor journal</p><h1>Wooden craft,<br><em>made personal.</em></h1><p class="hero-subcopy">Hand-carved wall decor, wooden furniture and the details that give a home its character.</p></div></section>
      <div class="topic-strip" aria-label="Browse by collection"><span>Browse by</span>{chips}</div>
      <section class="journal-list" aria-labelledby="latest-stories"><div class="list-heading"><h2 id="latest-stories">Wooden decor guides</h2><p>{len(posts)} product stories</p></div><ol class="story-list">{rows}</ol></section>
    </main>
""" + footer()


def article_page(post: dict, posts: list[dict]) -> str:
    output_file = ROOT / "blog" / post["slug"] / "index.html"
    canonical = f"{SITE_URL}{article_path(post)}"
    title = f"{post['title']} | MarwarMade"
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "mainEntityOfPage": canonical,
        "headline": post["title"],
        "description": post["excerpt"],
        "datePublished": date_iso(post["date"]),
        "dateModified": date_iso(post["date"]),
        "author": {"@type": "Organization", "name": "MarwarMade Editorial"},
        "publisher": {"@type": "Organization", "name": "MarwarMade"},
    }
    toc = "\n".join(f'<a href="#section-{index}">{index}. {text(section["heading"])}</a>' for index, section in enumerate(post["sections"], 1))
    sections = []
    for index, section in enumerate(post["sections"], 1):
        paragraphs = "".join(f"<p>{text(paragraph)}</p>" for paragraph in section["body"])
        sections.append(f'<section id="section-{index}"><h2>{text(section["heading"])}</h2>{paragraphs}</section>')
        if index < 4:
            sections.append(image_placeholder(post["images"][index], index + 1))
    checklist = "".join(f"<li>{text(item)}</li>" for item in post["buyingChecklist"])
    faq = post.get("faq", [])
    faq_toc = '<a href="#faq">Common questions</a>' if faq else ""
    faq_items = "".join(
        f'<details><summary>{text(item["question"])}</summary><p>{text(item["answer"])}</p></details>'
        for item in faq
    )
    faq_html = f'''<section class="article-faq" id="faq" aria-labelledby="faq-heading">
              <p class="article-faq__eyebrow">Frequently asked questions</p>
              <h2 id="faq-heading">Common questions</h2>
              {faq_items}
            </section>''' if faq else ""
    related = [candidate for candidate in posts if candidate["topic"] == post["topic"] and candidate["slug"] != post["slug"]][:3]
    related_html = "".join(f'<a href="{local_href(output_file, ROOT / "blog" / candidate["slug"] / "index.html")}">{text(candidate["title"])} <span aria-hidden="true">↗</span></a>' for candidate in related)
    return page_head(title, post["excerpt"], canonical, "article", output_file, schema) + header(output_file) + f"""
    <main>
      <article class="article-wrap" style="--art-one:{text(post['palette'][0])};--art-two:{text(post['palette'][1])};--art-three:{text(post['palette'][2])}">
        <header class="article-head"><a class="back-link" href="{local_href(output_file, ROOT / 'index.html')}">← All articles</a><p class="article-category">{text(post['category'])}</p><h1>{text(post['title'])}</h1><p class="article-dek">{text(post['dek'])}</p><p class="article-byline">MARWARMADE EDITORIAL · {text(post['date'])} · {text(post['readTime'])}</p></header>
        {image_placeholder(post['images'][0], 1, True)}
        <div class="article-layout">
          <nav class="article-toc" aria-label="Article sections"><p>In this story</p>{toc}<a href="#buying-guide">Before you order</a>{faq_toc}</nav>
          <div class="article-body">
            <p class="article-intro">{text(post['intro'])}</p>
            {''.join(sections)}
            <section class="buying-guide" id="buying-guide"><p class="buying-guide__eyebrow">Buy with confidence</p><h2>Quick checklist</h2><ul>{checklist}</ul></section>
            {faq_html}
            <aside class="article-note">Handmade wood naturally varies in grain, colour and small carving details. Real photographs and accurate specifications are essential before any purchase.</aside>
            <section class="article-cta" aria-label="Shop this product"><p>Shop with MarwarMade</p><h3>{text(post['cta'])}</h3><a href="https://marwarmade.com">Check price &amp; availability <span>↗</span></a></section>
            <section class="related" aria-labelledby="related-heading"><p class="related-label" id="related-heading">You may also like</p>{related_html}</section>
          </div>
        </div>
      </article>
    </main>
""" + footer()


def category_page(posts: list[dict], topic: str, slug: str, title: str, description: str) -> str:
    output_file = ROOT / "collections" / slug / "index.html"
    canonical = f"{SITE_URL}/collections/{slug}/"
    matching_posts = [post for post in posts if post["topic"] == topic]
    rows = "\n".join(story_row(post, output_file) for post in matching_posts)
    return page_head(f"{title} | MarwarMade", description, canonical, "website", output_file) + header(output_file) + f"""
    <main><section class="topic-view"><a class="back-link" href="{local_href(output_file, ROOT / 'index.html')}">← All articles</a><p class="eyebrow">MarwarMade collection guide</p><h1>{text(title)}</h1><p>{text(description)}</p><div class="list-heading"><h2>{len(matching_posts)} stories</h2><p>Browse the collection</p></div><ol class="story-list">{rows}</ol></section></main>
""" + footer()


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build() -> None:
    posts = load_posts()
    if len(posts) != 10:
        raise ValueError(f"Expected 10 articles, found {len(posts)}")

    write_file(ROOT / "index.html", home_page(posts))
    for post in posts:
        write_file(ROOT / "blog" / post["slug"] / "index.html", article_page(post, posts))

    categories = {
        "wall-decor": ("Wooden Wall Decor", "Helpful guides to sizing, styling and buying hand-carved wall pieces, jaali panels and wooden mirror frames."),
        "wooden-accents": ("Wooden Accents", "Useful guidance for wooden trunks, elephant figures, chaukidar dolls and hand-carved jewelry boxes."),
        "wooden-furniture": ("Wooden Furniture", "Understand the real dimensions, finish, use and care of reclaimed wood furniture before you buy."),
    }
    for slug, (title, description) in categories.items():
        topic = "furniture" if slug == "wooden-furniture" else slug
        write_file(ROOT / "collections" / slug / "index.html", category_page(posts, topic, slug, title, description))

    sitemap_urls = [f"{SITE_URL}/", *[f"{SITE_URL}{article_path(post)}" for post in posts], *[f"{SITE_URL}/collections/{slug}/" for slug in categories]]
    sitemap = "\n".join(f"  <url><loc>{url}</loc></url>" for url in sitemap_urls)
    write_file(ROOT / "sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sitemap}\n</urlset>\n')
    write_file(ROOT / "robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
    print(f"Built {len(posts)} articles, {len(categories)} collections, sitemap.xml and robots.txt.")


if __name__ == "__main__":
    build()
