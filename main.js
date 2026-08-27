import { renderRoute } from "./router.js";

const app = document.querySelector("#app");
const navLinks = [...document.querySelectorAll(".primary-nav a")];

document.querySelector("#year").textContent = new Date().getFullYear();

function updateView() {
  renderRoute(app, navLinks);
  window.scrollTo({ top: 0, behavior: "instant" });
  app.focus({ preventScroll: true });
}

window.addEventListener("hashchange", updateView);
updateView();
