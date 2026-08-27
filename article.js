function renderImagePlaceholder(description, index, isHero = false) {
  return `
    <figure class="image-placeholder${isHero ? " image-placeholder--hero" : ""}" aria-label="Image placeholder ${index}: ${description}">
      <div class="image-placeholder__number">IMAGE ${String(index).padStart(2, "0")}</div>
      <div class="image-placeholder__content">
        <span>Photo to be added</span>
        <figcaption>${description}</figcaption>
      </div>
    </figure>`;
}

export function renderArticle(posts, post) {
  if (!post) return null;
  const related = posts.filter((candidate) => candidate.topic === post.topic && candidate.slug !== post.slug).slice(0, 3);
  const [one, two, three] = post.palette;
  const images = post.images || [];

  return {
    title: `${post.title} | MarwarMade Journal`,
    activeNav: `#/topic/${post.topic}`,
    html: `
      <article class="article-wrap" style="--art-one:${one}; --art-two:${two}; --art-three:${three}">
        <header class="article-head">
          <a class="back-link" href="#/">← All articles</a>
          <p class="article-category">${post.category}</p>
          <h1>${post.title}</h1>
          <p class="article-dek">${post.dek}</p>
          <p class="article-byline">MARWARMADE EDITORIAL · ${post.date} · ${post.readTime}</p>
        </header>
        ${images[0] ? renderImagePlaceholder(images[0], 1, true) : ""}
        <div class="article-layout">
          <nav class="article-toc" aria-label="Article sections">
            <p>In this story</p>
            ${post.sections.map((section, index) => `<a href="#section-${index + 1}">${index + 1}. ${section.heading}</a>`).join("")}
            <a href="#buying-guide">Before you order</a>
            ${post.faq?.length ? `<a href="#faq">Common questions</a>` : ""}
          </nav>
          <div class="article-body">
            <p class="article-intro">${post.intro}</p>
            ${post.sections.map((section, index) => `
              <section id="section-${index + 1}">
                <h2>${section.heading}</h2>
                ${section.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
              </section>
              ${index < 3 && images[index + 1] ? renderImagePlaceholder(images[index + 1], index + 2) : ""}`).join("")}
            <section class="buying-guide" id="buying-guide">
              <p class="buying-guide__eyebrow">Buy with confidence</p>
              <h2>Quick checklist</h2>
              <ul>${post.buyingChecklist.map((item) => `<li>${item}</li>`).join("")}</ul>
            </section>
            ${post.faq?.length ? `
              <section class="article-faq" id="faq" aria-labelledby="faq-heading">
                <p class="article-faq__eyebrow">Frequently asked questions</p>
                <h2 id="faq-heading">Common questions</h2>
                ${post.faq.map((item) => `<details><summary>${item.question}</summary><p>${item.answer}</p></details>`).join("")}
              </section>` : ""}
            <aside class="article-note">Handmade wood naturally varies in grain, colour and small carving details. Real photographs and accurate specifications are essential before any purchase.</aside>
            <section class="article-cta" aria-label="Ask about this product">
              <p>Shop with MarwarMade</p>
              <h3>${post.cta}</h3>
              <a href="https://marwarmade.com" target="_blank" rel="noreferrer">Check price & availability <span>↗</span></a>
            </section>
            ${related.length ? `
              <section class="related" aria-labelledby="related-heading">
                <p class="related-label" id="related-heading">You may also like</p>
                ${related.map((story) => `<a href="#/blog/${story.slug}">${story.title} <span aria-hidden="true">↗</span></a>`).join("")}
              </section>` : ""}
          </div>
        </div>
      </article>`
  };
}
