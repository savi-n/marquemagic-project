export const flower = history => {
	const h = history.location.pathname.split('/');
	const endpointNum = Number(h[h.length - 1]) + 1;
	h[h.length - 1] = endpointNum.toString();
	return h.join('/');
};
