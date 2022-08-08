import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import ToastController from './ToastController';
import generateUID from '../../utils/uid';

const Wrapper = styled.div`
	box-sizing: border-box;
	max-height: 100vh;
	max-width: 100vw;
	top: 0;
	right: 0;
	overflow: hidden;
	pointer-events: none;
	position: fixed;
	z-index: 99999;
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	margin-bottom: 20px;
`;

const ToastContext = createContext();
const { Provider } = ToastContext;

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const add = newToast => {
		const id = generateUID();
		setToasts([{ ...newToast, id }, ...toasts]);
	};

	const remove = useCallback(toastId => {
		setToasts(toast => toast.filter(t => t.id !== toastId));
	}, []);

	const root = document.body;
	return (
		<Provider value={{ add }}>
			{children}
			{createPortal(
				<Wrapper>
					{toasts.map(toast => (
						<ToastController key={toast.id} toast={toast} remove={remove} />
					))}
				</Wrapper>,
				root
			)}
		</Provider>
	);
};

export const useToasts = () => {
	const ctx = useContext(ToastContext);

	return {
		addToast: ctx.add,
	};
};
