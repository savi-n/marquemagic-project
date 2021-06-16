import { useState, useEffect } from "react";
import axios from "axios";

export default function useFetch({
  url,
  options = { method: "GET" },
  headers = {},
} = {}) {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  headers = {
    "Content-Type": "application/json",
    ...headers,
  };

  const newRequest = (url, options, headers = {}) => {
    return axios({
      url,
      headers,
      ...options,
    });
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    const fetchData = async () => {
      try {
        const res = await newRequest(
          url,
          { ...options, cancelToken: source.token },
          headers
        );
        const json = res.data;
        setResponse(json);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    url && fetchData();
    return () => {
      source.cancel("axios request cancelled");
    };
  }, []);
  return { response, error, loading, newRequest };
}
