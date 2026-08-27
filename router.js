import { posts, topicLabels } from "./articles.js";
import { renderArticle } from "./article.js";
import { renderJournal, renderTopic } from "./journal.js";

export function renderRoute(app, navLinks) {
  const path = window.location.hash.replace(/^#/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  let view;

  if (!segments.length) {
    view = renderJournal(posts, topicLabels);
  } else if (segments[0] === "topic" && segments[1]) {
    view = renderTopic(posts, topicLabels, segments[1]);
  } else if (segments[0] === "blog" && segments[1]) {
    view = renderArticle(posts, posts.find((post) => post.slug === segments[1]));
  }

  if (!view) view = renderNotFound();
  app.innerHTML = view.html;
  document.title = view.title;
  navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === view.activeNav));
}

function renderNotFound() {
  return {
    title: "Page not found | MarwarMade Journal",
    activeNav: "",
    html: `<section class="topic-view empty-state"><p class="eyebrow">Not found</p><h1>This story has moved.</h1><p>Return to the journal to find a thoughtful read for your home.</p><a class="shop-link" href="#/">Back to the journal <span>↗</span></a></section>`
  };
}
