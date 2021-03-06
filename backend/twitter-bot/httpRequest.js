const fetch = require("node-fetch");
const { error, info } = require("firebase-functions/lib/logger");
const { URL, URLSearchParams } = require("url");

exports.httpRequest = async (urlString, params, requestOptions) => {
  const url = new URL(urlString);
  if (requestOptions.method == "GET") {
    url.search = new URLSearchParams(params).toString();
  }
  const response = await fetch(url, requestOptions);
  if (response.status !== 200) {
    error("Failed to fetch Twitter API. HTTP Status:", response.status, ":", response.statusText);
    return false;
  }
  const responseJson = await response.json();
  if (!responseJson.data) {
    if (responseJson.meta.result_count == 0) {
      info("No data available. (Fetch to latest).");
      return false;
    }
    error(responseJson.title, ":", responseJson.errors[0].message);
    return false;
  }
  return responseJson;
};
