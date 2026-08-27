export function renderStoryRow(post) {
  return `
    <li>
      <a class="story-row" href="#/blog/${post.slug}" aria-label="Read ${post.title}">
        <span class="story-no">${post.number}</span>
        <span class="story-main">
          <span class="story-meta">${post.category} · ${post.readTime}</span>
          <span class="story-title">${post.title}</span>
          <span class="story-excerpt">${post.excerpt}</span>
        </span>
        <span class="read-story" aria-hidden="true">↗</span>
      </a>
    </li>`;
}

export function renderJournal(posts, topicLabels) {
  return {
    title: "MarwarMade | Wooden Decor Journal",
    activeNav: "#/",
    html: `
      <section class="journal-hero">
        <div>
          <p class="eyebrow">MarwarMade wooden decor journal</p>
          <h1>Wooden craft,<br /><em>made personal.</em></h1>
          <p class="hero-subcopy">Hand-carved wall decor, wooden furniture and the details that give a home its character.</p>
        </div>
      </section>

      <div class="topic-strip" aria-label="Browse journal topics">
        <span>Browse by</span>
        ${Object.entries(topicLabels).map(([slug, label]) => `<a class="topic-chip" href="#/topic/${slug}">${label}</a>`).join("")}
      </div>

      <section class="journal-list" aria-labelledby="latest-stories">
        <div class="list-heading">
          <h2 id="latest-stories">Wooden decor guides</h2>
          <p>${posts.length} product stories</p>
        </div>
        <ol class="story-list">${posts.map(renderStoryRow).join("")}</ol>
      </section>`
  };
}

export function renderTopic(posts, topicLabels, topic) {
  const label = topicLabels[topic];
  if (!label) return null;
  const selectedPosts = posts.filter((post) => post.topic === topic);
  return {
    title: `${label} | MarwarMade Journal`,
    activeNav: `#/topic/${topic}`,
    html: `
      <section class="topic-view">
        <a class="back-link" href="#/">← All articles</a>
        <p class="eyebrow">MarwarMade wooden decor</p>
        <h1>${label}</h1>
        <p>${topicDescription(topic)}</p>
        <div class="list-heading">
          <h2>${selectedPosts.length} ${selectedPosts.length === 1 ? "story" : "stories"}</h2>
          <p>Browse the collection</p>
        </div>
        <ol class="story-list">${selectedPosts.map(renderStoryRow).join("")}</ol>
      </section>`
  };
}

function topicDescription(topic) {
  const descriptions = {
    "wall-decor": "Helpful guides to sizing, styling and buying hand-carved wall pieces, jaali panels and wooden mirror frames.",
    "wooden-accents": "Useful guidance for wooden trunks, elephant figures, chaukidar dolls and hand-carved jewelry boxes.",
    furniture: "Understand the real dimensions, finish, use and care of reclaimed wood furniture before you buy."
  };
  return descriptions[topic];
}
