export function _requestTasks(
  params = { limit, page, type, period, order, status }
) {
  const urlParams = new URLSearchParams(params);

  return fetch(`tasks/?${urlParams}`).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(response.status);
    }
  });
}
