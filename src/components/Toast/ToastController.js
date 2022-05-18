import { useEffect } from 'react';

import Toast from './ToastElement';

const defaultTimeDelay = 5000;

const TOAST_TYPES = {
	success: 'success',
	warning: 'warning',
	error: 'error',
	info: 'info',
};

export default function ToastController({ toast, remove }) {
	useEffect(() => {
		let timer = setTimeout(() => remove(toast.id), defaultTimeDelay);
		return () => clearTimeout(timer);
		// eslint-disable-next-line
	}, [toast]);
	return <Toast {...toast} type={TOAST_TYPES[toast.type] || 'default'} />;
}
