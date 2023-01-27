import { _requestTasks } from "./server-api";
import { formatDatetime } from "./utils";

const refs = {
  tableBody: document.querySelector(".js-table-body"),
  filter: document.querySelector(".js-filter"),
  generalProcessedCounter: document.querySelector(
    ".js-general-processed-counter"
  ),
  generalFailedCounter: document.querySelector(".js-general-failed-counter"),
  generalTotalCounter: document.querySelector(".js-general-total-counter"),
  processedCounter: document.querySelector(".js-processed-counter"),
  failedCounter: document.querySelector(".js-failed-counter"),
  period: document.querySelector(".js-period"),
  sortOrder: document.querySelector(".js-sort-order"),
  currentType: document.querySelector(".js-type"),
  firstPage: document.querySelector(".js-first-page"),
  previousPage: document.querySelector(".js-previous-page"),
  nextPage: document.querySelector(".js-next-page"),
  lastPage: document.querySelector(".js-last-page"),
  pageNumber: document.querySelector(".js-page-number"),
  numberOfPages: document.querySelector(".js-number-of-pages"),
  statusFlag: document.querySelector(".js-status-flag"),
};
const DISPLAY_LIMIT = 50;
const DATA = [];
let pageNumber = 0;
let totalPages = 0;

document.addEventListener("DOMContentLoaded", () => {
  extractSettings();
  requestTasks(pageNumber);
});

refs.tableBody.addEventListener("click", (event) => {
  if (event.target.classList.contains("js-data-cell")) {
    modalOpen(DATA[Number(event.target.dataset["id"])].originalJson);
  } else if (event.target.classList.contains("js-reason-cell")) {
    modalOpen(DATA[Number(event.target.dataset["id"])].failureReason);
  }
});

refs.filter.addEventListener("input", (event) => {
  if (event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT") {
    requestTasks(0);
  }
});

refs.nextPage.addEventListener("click", getNextPage);
refs.firstPage.addEventListener("click", getFirstPage);
refs.previousPage.addEventListener("click", getPreviousPage);
refs.lastPage.addEventListener("click", getLastPage);

function updateData(data) {
  DATA.splice(0, DISPLAY_LIMIT);
  data.tasks.forEach((val) => DATA.push(val));

  refs.generalProcessedCounter.textContent = data.generalInfo.processed;
  refs.generalFailedCounter.textContent = data.generalInfo.failed;
  refs.generalTotalCounter.textContent = data.generalInfo.total;
  totalPages = Math.ceil(Number(data.statistics.total) / DISPLAY_LIMIT);
  refs.numberOfPages.textContent = totalPages;
  refs.processedCounter.textContent = data.statistics.processed;
  refs.failedCounter.textContent = data.statistics.failed;
  refs.pageNumber.textContent = pageNumber + 1;

  updateMarkup(DATA);
  updateTypes([...data.generalInfo.types]);
  saveSettings();
}

function saveSettings() {
  const settings = {
    currentPage: pageNumber,
    currentType: refs.currentType.value,
    statusFlag: refs.statusFlag.checked,
    sortOrder: refs.sortOrder.value,
    period: refs.period.value,
  };
  localStorage.setItem("settings", JSON.stringify(settings));
}

function extractSettings() {
  let settings = localStorage.getItem("settings");
  if (settings) {
    settings = JSON.parse(settings);
    // pageNumber = settings.currentPage;
    // refs.pageNumber.textContent = pageNumber + 1;
    refs.currentType.value = settings.currentType;
    refs.statusFlag.checked = settings.statusFlag;
    refs.sortOrder.value = settings.sortOrder;
    refs.period.value = settings.period;
  }
}

function updateTypes(types) {
  for (const type of types) {
    if (![...refs.currentType.options].find((elem) => elem.value === type)) {
      const html = `<option value="${type}">${type}</option>`;
      refs.currentType.insertAdjacentHTML("beforeend", html);
    }
  }
}

function updateMarkup(tasks) {
  const markup = tasks.reduce((accum, task, index) => {
    let failureReason =
      task.status === "Failed" ? task.failureReason.slice(0, 30) : "";
    if (failureReason.length === 30) {
      failureReason += "...";
    }
    const fieldNumber = pageNumber * DISPLAY_LIMIT + index + 1;
    return (
      accum +
      `
    <tr class="table__row js-table-row">
      <td class="table__cell">
        <p class="table__data">${fieldNumber}</p>
      </td>
      <td class="table__cell table__cell--interactive">
        <p class="table__data js-data-cell" data-id="${index}">${task.id}</p>
      </td>
      <td class="table__cell">
        <time class="table__data">${formatDatetime(task.timestamp)}</time>
      </td>
      <td class="table__cell">
        <p class="table__data">${task.type}</p>
      </td>
      <td class="table__cell">
        <p class="table__data">${task.server}</p>
      </td>
      <td class="table__cell">
        <p class="table__data">${task.status}</p>
      </td>
      <td class="table__cell table__cell--interactive">
        <p class="table__data table__long-cell js-reason-cell" data-id="${index}">${failureReason}</p>
      </td>
    </tr>
  `
    );
  }, "");

  refs.tableBody.innerHTML = markup;
}

// Navigation

function getFirstPage(event) {
  requestTasks(0);
}

function getPreviousPage(event) {
  if (pageNumber > 0) {
    requestTasks(pageNumber - 1);
  }
}

function getNextPage(event) {
  if (pageNumber < totalPages - 1) {
    requestTasks(pageNumber + 1);
  }
}

function getLastPage(event) {
  requestTasks(totalPages - 1);
}

// Requests

function requestTasks(nextPage) {
  _requestTasks({
    limit: DISPLAY_LIMIT,
    page: nextPage,
    type: refs.currentType.value,
    period: refs.period.value,
    order: refs.sortOrder.value,
    status: Number(refs.statusFlag.checked),
  })
    .then((data) => {
      if (data.tasks.length) {
        pageNumber = nextPage;
      } else {
        pageNumber = 0;
      }
      updateData(data);
    })
    .catch((error) => {
      // errorHandler(error);
      console.log(error);
    });
}
