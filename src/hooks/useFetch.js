import { useState, useEffect } from 'react';
import axios from 'axios';
import { BANK_LIST_FETCH, BANK_LIST_FETCH_RESPONSE } from '_config/app.config';
import { getFlowData } from 'utils/localStore';

export default function useFetch({
	url,
	options = { method: 'GET' },
	headers = {},
} = {}) {
	const [response, setResponse] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	headers = {
		'Content-Type': 'application/json',
		...headers,
	};

	const newRequest = (url, options, headers = {}) => {
		if (options.timeout) {
			axios.defaults.timeout = options.timeout;
		}
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
				// console.log('usefetch-res-', json);
				setResponse(json);
				setLoading(false);
			} catch (error) {
				setError(error);
				setLoading(false);
			}
		};
		if (isViewLoan) return;
		if (url === BANK_LIST_FETCH) {
			const oldBankList = getFlowData(BANK_LIST_FETCH_RESPONSE);
			if (oldBankList && oldBankList?.length > 0) {
				return setResponse(oldBankList);
			}
		}
		url && fetchData();
		return () => {
			source.cancel('axios request cancelled');
		};
		// eslint-disable-next-line
	}, []);
	return { response, error, loading, newRequest };
}
