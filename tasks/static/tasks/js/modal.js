const BODY = document.querySelector("body");
const BACKDROP = document.querySelector(".js-backdrop");
const MODAL = document.querySelector(".js-modal");
const MODAL_DATA = document.querySelector(".js-modal-data");
const MODAL_CLOSE_BTN = document.querySelector(".js-modal-close-btn");

MODAL_CLOSE_BTN.addEventListener("click", () => {
  modalClose();
});

BACKDROP.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    modalClose();
  }
});

function modalClose() {
  BACKDROP.classList.remove("js-modal-visible");
}

function modalOpen(data) {
  MODAL_DATA.innerHTML = data;
  MODAL_DATA.scrollIntoView(true);
  BACKDROP.classList.add("js-modal-visible");
}
