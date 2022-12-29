const BODY = document.querySelector("body");
const BACKDROP = document.querySelector(".js-backdrop");
const MODAL = document.querySelector(".js-modal");
const MODAL_DATA = document.querySelector(".js-modal-data");
const MODAL_CLOSE_BTN = document.querySelector(".js-modal-close-btn");

MODAL_CLOSE_BTN.addEventListener("click", () => {
  modalClose();
});

BACKDROP.addEventListener("click", (e) => {
  if (e.target === BACKDROP) {
    modalClose();
  }
});

function modalOpen() {
  MODAL_DATA.scrollIntoView(true);
  BACKDROP.classList.add("js-modal-visible");
}

function modalClose() {
  BACKDROP.classList.remove("js-modal-visible");
}

function modalDataOpen(index) {
  MODAL_DATA.innerHTML = tableData[index].originalJson;
  modalOpen();
}

function modalReasonOpen(index) {
  MODAL_DATA.innerHTML = tableData[index].failureReason;
  modalOpen();
}
