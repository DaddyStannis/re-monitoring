const TABLE_BODY = document.querySelector(".js-table-body");
const FILTER = document.querySelector(".js-filter");
const GENERAL_PROCESSED_COUNTER = document.querySelector(
  ".js-general-processed-counter"
);
const GENERAL_FAILED_COUNTER = document.querySelector(
  ".js-general-failed-counter"
);
const GENERAL_TOTAL_COUNTER = document.querySelector(
  ".js-general-total-counter"
);
const PROCESSED_COUNTER = document.querySelector(".js-processed-counter");
const FAILED_COUNTER = document.querySelector(".js-failed-counter");
const PERIOD_SELECT = document.querySelector(".js-period-select");
const DATETIME_SORT_SELECT = document.querySelector(".js-datetime-sort-select");
const TYPE_SELECT = document.querySelector(".js-type-select");
const FIRST_PAGE_BTN = document.querySelector(".js-first-page-btn");
const PREVIOUS_PAGE_BTN = document.querySelector(".js-previous-page-btn");
const NEXT_PAGE_BTN = document.querySelector(".js-next-page-btn");
const LAST_PAGE_BTN = document.querySelector(".js-last-page-btn");
const PAGE_NUMBER = document.querySelector(".js-page-number");
const ONLY_FAILED_CHECKBOX = document.querySelector(".js-only-failed-checkbox");
const TABLE_DISPLAY_LIMIT = 50;

let tableDataCells = null;
let tableReasonCells = null;
let tableData = [];
let types = [];
let fieldIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  getFirstPage();
});

TABLE_BODY.addEventListener("click", (event) => {
  if (event.target.classList.contains("js-data-cell")) {
    modalOpen(tableData[Number(event.target.dataset["id"])].originalJson);
  } else if (event.target.classList.contains("js-reason-cell")) {
    modalOpen(tableData[Number(event.target.dataset["id"])].failureReason);
  }
});

FILTER.addEventListener("input", (event) => {
  if (event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT") {
    requestTasks();
  }
});

NEXT_PAGE_BTN.addEventListener("click", getNextPage);

function updateData() {
  updateFields(tableData);
  updateTypes(types);
}

function updateTypes(types) {
  for (const type of types) {
    if (![...TYPE_SELECT.options].find((elem) => elem.value === type)) {
      const html = `
        <option value="${type}">${type}</option>
      `;
      TYPE_SELECT.insertAdjacentHTML("beforeend", html);
    }
  }
}

function updateFields(tasks) {
  const getHtmlField = (task, index) => {
    let failureReason =
      task.status === "Failed" ? task.failureReason.slice(0, 30) : "";
    if (failureReason.length === 30) {
      failureReason += "...";
    }
    return `
    <tr class="table__row js-table-row">
      <td class="table__cell">
        <p class="table__data">${index + 1}</p>
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
  `;
  };

  TABLE_BODY.innerHTML = "";

  for (const i in tasks) {
    TABLE_BODY.insertAdjacentHTML(
      "beforeend",
      getHtmlField(tasks[i], Number(i))
    );
  }
}

function getFirstPage() {
  fieldIndex = 0;
  PAGE_NUMBER.textContent = 1;
  requestTasks();
}

function getPreviousPage() {
  if (fieldIndex < TABLE_DISPLAY_LIMIT) {
    return;
  } else {
    fieldIndex -= TABLE_DISPLAY_LIMIT;
    PAGE_NUMBER.textContent = Number(PAGE_NUMBER.textContent) - 1;
    requestTasks();
  }
}

function getNextPage() {
  if (TABLE_BODY.childElementCount < TABLE_DISPLAY_LIMIT) {
    return;
  } else {
    fieldIndex += TABLE_DISPLAY_LIMIT;
    PAGE_NUMBER.textContent = Number(PAGE_NUMBER.textContent) + 1;
    requestTasks();
  }
}

function getLastPage() {}
