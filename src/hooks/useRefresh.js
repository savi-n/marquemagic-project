import { useEffect } from 'react';
import browserHistory from 'history/createBrowserHistory';

export default function useRefresh() {
	useEffect(() => {
		const backListener = browserHistory.listen(location => {
			if (location.action === 'POP') {
				console.info('back button');
			}
		});
		return () => {
			backListener();
		};
		// window.onbeforeunload = alertUser;

		// return () => {
		//   window.onbeforeunload = null;
		// };
	}, []);

	const alertUser = e => {
		e.preventDefault();
		e.returnValue = '';
		alert('closing');
	};

	return {};
}
