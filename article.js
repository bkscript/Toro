export function renderArticle(posts, post) {
  if (!post) return null;
  const related = posts.filter((candidate) => candidate.topic === post.topic && candidate.slug !== post.slug).slice(0, 3);
  const [one, two, three] = post.palette;
  return {
    title: `${post.title} | MarwarMade Journal`,
    activeNav: `#/topic/${post.topic}`,
    html: `
      <article class="article-wrap">
        <header class="article-head">
          <a class="back-link" href="#/">← Back to the journal</a>
          <p class="article-category">${post.category}</p>
          <h1>${post.title}</h1>
          <p class="article-dek">${post.dek}</p>
          <p class="article-byline">BY <span>MARWARMADE EDITORIAL</span> · ${post.date} · ${post.readTime}</p>
        </header>
        <div class="article-art" style="--art-one:${one}; --art-two:${two}; --art-three:${three}" role="img" aria-label="Abstract editorial artwork for ${post.title}">
          <span class="art-shape"></span>
        </div>
        <div class="article-layout">
          <nav class="article-toc" aria-label="Article sections">
            <p>In this story</p>
            ${post.sections.map((section, index) => `<a href="#section-${index + 1}">${index + 1}. ${section.heading}</a>`).join("")}
          </nav>
          <div class="article-body">
            <p class="article-intro">${post.intro}</p>
            ${post.sections.map((section, index) => `
              <section id="section-${index + 1}">
                <h2>${section.heading}</h2>
                ${section.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
              </section>`).join("")}
            <aside class="article-note">A thoughtfully made home is not created in one day. Choose what is useful, keep what you love, and let the rest arrive slowly.</aside>
            <section class="article-cta" aria-label="Related MarwarMade collection">
              <p>Made for everyday living</p>
              <h3>${post.cta}</h3>
              <a href="https://marwarmade.com" target="_blank" rel="noreferrer">Explore MarwarMade <span>↗</span></a>
            </section>
            ${related.length ? `
              <section class="related" aria-labelledby="related-heading">
                <p class="related-label" id="related-heading">Keep reading</p>
                ${related.map((story) => `<a href="#/blog/${story.slug}">${story.title} <span aria-hidden="true">↗</span></a>`).join("")}
              </section>` : ""}
          </div>
        </div>
      </article>`
  };
}
