const SERVER_URL = "tasks/";
const TABLE_BODY = document.querySelector(".js-table-body");
const PROCESSED_COUNTER = document.querySelector(".js-processed-counter");
const FAILED_COUNTER = document.querySelector(".js-failed-counter");
const PERIOD_SELECT = document.querySelector(".js-period-select");
const DATETIME_SORT_SELECT = document.querySelector(".js-datetime-sort-select");
const TYPE_SELECT = document.querySelector(".js-type-select");
const TASKS = [];

let tableDataCells = null;
let tableReasonCells = null;
let tableData = [];
let types = [];

document.addEventListener("DOMContentLoaded", () => {
  const request = new XMLHttpRequest();
  request.open("GET", SERVER_URL);
  request.responseType = "text";

  request.onload = function () {
    JSON.parse(request.response).forEach((val) => TASKS.push(val));
    updateTable();

    types = TASKS.map((task) => task.type).filter(
      (type, index, array) => array.indexOf(type) === index
    );

    for (const type of types) {
      let option = document.createElement("option");
      option.value = type;
      option.innerHTML = type;
      TYPE_SELECT.appendChild(option);
    }
  };

  request.send();
});

PERIOD_SELECT.addEventListener("input", (event) => {
  updateTable();
});

TYPE_SELECT.addEventListener("input", (event) => {
  updateTable();
});

DATETIME_SORT_SELECT.addEventListener("input", (event) => {
  updateTable();
});

function updateTable() {
  deleteAllFields();

  tableData = [...TASKS];
  tableData = filterByType(tableData, TYPE_SELECT.value);
  tableData = filterByPeriod(tableData, PERIOD_SELECT.value);
  sortByDate(tableData, DATETIME_SORT_SELECT.value);
  countAndDisplayTaskStatusCounters(tableData);

  writeAllFields(tableData);

  tableDataCells = document.querySelectorAll(".js-data-cell");
  tableReasonCells = document.querySelectorAll(".js-reason-cell");

  const addEventListenerToClickableCells = (cellList, callback) => {
    for (let i = 0; i < cellList.length; ++i) {
      cellList[i].addEventListener("click", () => {
        callback(i);
      });
    }
  };

  addEventListenerToClickableCells(tableDataCells, modalDataOpen);
  addEventListenerToClickableCells(tableReasonCells, modalReasonOpen);
}

/************************************ DATETIME ************************************/

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function addLeadingZero(num) {
  return num < 10 ? "0" + num : num;
}

function formatDatetime(timestamp) {
  const datetime = new Date(Number(timestamp) * 1000);
  const Y = datetime.getFullYear();
  const M = addLeadingZero(datetime.getMonth() + 1);
  const D = addLeadingZero(datetime.getDate());
  const d = DAYS[datetime.getDay()];
  const h = addLeadingZero(datetime.getHours());
  const m = addLeadingZero(datetime.getMinutes());
  const s = addLeadingZero(datetime.getSeconds());
  return `${D}.${M}.${Y} ${h}:${m}:${s} (${d})`;
}

function countAndDisplayTaskStatusCounters(tasks) {
  let processed = 0;
  let failed = 0;

  for (const task of tasks) {
    if (task.status === "Processed") {
      processed++;
    } else {
      failed++;
    }
  }
  PROCESSED_COUNTER.innerHTML = processed;
  FAILED_COUNTER.innerHTML = failed;
}

/************************************ TABLE ROWS ************************************/

function writeAllFields(taskList) {
  const getHtmlField = (task) => {
    return `
    <tr class="table__row js-table-row">
      <td class="table__cell js-data-cell">
        <p class="table__data">${task.id}</p>
      </td>
      <td class="table__cell">
        <time>${formatDatetime(task.timestamp)}</time>
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
      <td class="table__cell js-reason-cell">
        <p class="table__data">${task.failureReason}</p>
      </td>
    </tr>
  `;
  };

  for (const task of taskList) {
    TABLE_BODY.insertAdjacentHTML("beforeend", getHtmlField(task));
  }
}

function deleteAllFields() {
  const allRows = document.querySelectorAll(".js-table-row");
  allRows.forEach((row) => row.remove());
}

/************************************ FILTER ************************************/

function convertDaysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

function filterByPeriod(tasks, period = Infinity) {
  const periodInMilliseconds = convertDaysToMilliseconds(period);
  const timestamp = Math.round(Date.now() - periodInMilliseconds);
  const filtered = tasks.filter((task) => {
    if (Number(task.timestamp) * 1000 >= timestamp) return task;
  });
  return filtered;
}

function filterByType(tasks, type) {
  if (!types.includes(type)) {
    return tasks;
  } else {
    return tasks.filter((task) => (task.type === type ? task : undefined));
  }
}

/************************************ SORTER ************************************/

function sortByDate(tasks, newerFirst) {
  return tasks.sort((a, b) => {
    atime = Number(a.timestamp);
    btime = Number(b.timestamp);
    return Number(newerFirst) ? btime - atime : atime - btime;
  });
}
