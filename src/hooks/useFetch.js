import { useState, useEffect } from "react";
import axios from "axios";
import { string, shape, oneOf } from "prop-types";

export default function useFetch({
  url,
  options = { method: "GET" },
  headers = {},
}) {
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
    const fetchData = async () => {
      try {
        const res = await newRequest(url, options, headers);
        const json = res.data;
        setResponse(json);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
    return () => {};
  }, []);
  return { response, error, loading, newRequest };
}

useFetch.defaultProps = {
  options: {
    method: "GET",
  },
};

useFetch.propTypes = {
  url: string.isRequired,
  options: shape({
    method: oneOf(["GET", "POST", "PUT"]),
  }),
};
