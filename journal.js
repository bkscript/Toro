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
    title: "MarwarMade Journal | Handmade Home Stories",
    activeNav: "#/",
    html: `
      <section class="journal-hero">
        <div>
          <p class="eyebrow">The MarwarMade journal</p>
          <h1>Make home feel<br /><em>like yours.</em></h1>
          <p class="hero-subcopy">Thoughtful guides for homes filled with warmth, craft and a sense of place.</p>
        </div>
      </section>

      <div class="topic-strip" aria-label="Browse journal topics">
        <span>Browse by</span>
        ${Object.entries(topicLabels).map(([slug, label]) => `<a class="topic-chip" href="#/topic/${slug}">${label}</a>`).join("")}
      </div>

      <section class="journal-list" aria-labelledby="latest-stories">
        <div class="list-heading">
          <h2 id="latest-stories">Latest stories</h2>
          <p>${posts.length} thoughtful reads</p>
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
        <a class="back-link" href="#/">← All stories</a>
        <p class="eyebrow">MarwarMade journal</p>
        <h1>${label}</h1>
        <p>${topicDescription(topic)}</p>
        <div class="list-heading">
          <h2>${selectedPosts.length} ${selectedPosts.length === 1 ? "story" : "stories"}</h2>
          <p>Read slowly</p>
        </div>
        <ol class="story-list">${selectedPosts.map(renderStoryRow).join("")}</ol>
      </section>`
  };
}

function topicDescription(topic) {
  const descriptions = {
    "home-decor": "Considered ideas for bringing colour, texture and handmade character into the rooms you live in every day.",
    gifting: "Thoughtful gift ideas for new homes, new rituals and the people who make a space feel warm.",
    craft: "Stories behind the materials, techniques and traditions that make handmade objects worth keeping.",
    "slow-living": "Simple ways to make everyday routines feel calmer, warmer and more at home."
  };
  return descriptions[topic];
}
