function requestTasks() {
  const responseHandler = (response) => {
    data = JSON.parse(response);
    tableData.splice(0, TABLE_DISPLAY_LIMIT);
    data.tasks.forEach((val) => tableData.push(val));
    GENERAL_PROCESSED_COUNTER.textContent = data.generalInfo.processed;
    GENERAL_FAILED_COUNTER.textContent = data.generalInfo.failed;
    GENERAL_TOTAL_COUNTER.textContent = data.generalInfo.total;
    PROCESSED_COUNTER.textContent = data.statistics.processed;
    FAILED_COUNTER.textContent = data.statistics.failed;
    types = [...data.generalInfo.types];
    updateData();
  };

  const request = {
    url: `tasks/?limit=${TABLE_DISPLAY_LIMIT}&index=${fieldIndex}&type=${
      TYPE_SELECT.value
    }&period=${PERIOD_SELECT.value}&newer-first=${
      DATETIME_SORT_SELECT.value
    }&only-failed=${Number(ONLY_FAILED_CHECKBOX.checked)}`,
    method: "GET",
    responseType: "text",
    callback: responseHandler,
  };

  sendServerRequest(request);
}

function sendServerRequest({ url, method, responseType, callback }) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.responseType = responseType;

  request.onload = function () {
    callback(request.response);
  };

  request.send();
}
