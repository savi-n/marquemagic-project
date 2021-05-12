import { useState, useEffect } from 'react';
import axios from 'axios';
import { string, shape, oneOf } from 'prop-types';

import { API_END_POINT } from '../config';

export default function useFetch({ url, options = { method: 'GET' } }) {
	const [response, setResponse] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	const headers = {
		'Content-Type': 'application/json'
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios({ url: API_END_POINT + url, data: { ...options, headers } });
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
	return { response, error, loading };
}

useFetch.propTypes = {
	url: string.isRequired,
	options: shape({
		name: oneOf(['GET', 'POST', 'PUT'])
	})
};
