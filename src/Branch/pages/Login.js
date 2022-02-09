import { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import useForm from '../../hooks/useForm';
import useFetch from '../../hooks/useFetch';
import { useToasts } from '../../components/Toast/ToastProvider';
import Button from '../../components/Button';
import { BRANCH_LOGIN_API } from '../../_config/branch.config';
// import { NC_STATUS_CODE } from "../../_config/app.config";
import { BranchUserContext } from '../../reducer/branchUserReducer';

const FieldWrapper = styled.div`
	padding: 20px 0;
	width: 100%;
`;

const WrapperContent = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Wrapper = styled.form`
	width: 30%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const ErrorMessage = styled.div`
	padding-top: 10px;
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;

export default function Login() {
	useEffect(() => {
		localStorage.removeItem('token');
		localStorage.removeItem('lActive');
	}, []);
	const { register, handleSubmit, formState } = useForm();
	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	const { actions } = useContext(BranchUserContext);
	const [loggingIn, setLoggingIn] = useState(false);
	const history = useHistory();

	const onSubmit = async ({ email }) => {
		if (!email) return;
		setLoggingIn(true);
		try {
			const loggingIn = await newRequest(BRANCH_LOGIN_API, {
				method: 'POST',
				data: {
					email,
				},
			});

			const loggedIn = loggingIn.data;

			//   if (loggedIn.statusCode === NC_STATUS_CODE.NC200) {
			if (loggedIn.token) {
				localStorage.setItem('token', loggedIn.token);
				actions.setBranchUserToken(loggedIn.token);
				history.push(`/branch/dashboard`);
				return;
			}

			throw new Error(loggedIn.message);
		} catch (err) {
			console.log(err);
			addToast({
				message: err.message || 'Something Went Wrong. Try Again Later!',
				type: 'error',
			});
		}
		setLoggingIn(false);
	};

	return (
		<WrapperContent>
			<Wrapper onSubmit={handleSubmit(onSubmit)}>
				<FieldWrapper>
					{register({
						name: 'email',
						placeholder: 'Enter Email Address',
						rules: { email: true },
						value: formState?.values?.email,
					})}
					{(formState?.submit?.isSubmited || formState?.touched?.['email']) &&
						formState?.error?.['email'] && (
							<ErrorMessage>{formState?.error?.['email']}</ErrorMessage>
						)}
				</FieldWrapper>

				<Button
					type='submit'
					name='LOGIN'
					fill
					disabled={
						!formState.values?.email || !!formState.error?.email || loggingIn
					}
				/>
			</Wrapper>
		</WrapperContent>
	);
}
