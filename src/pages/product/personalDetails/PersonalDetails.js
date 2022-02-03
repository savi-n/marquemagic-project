import { useContext } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import useFetch from '../../../hooks/useFetch';
import PersonalDetails from '../../../shared/components/PersonalDetails/PersonalDetails';
import SalaryDetails from '../../../shared/components/SalaryDetails/SalaryDetails';
import Button from '../../../components/Button';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { UserContext } from '../../../reducer/userReducer';
import { AppContext } from '../../../reducer/appReducer';
import { useToasts } from '../../../components/Toast/ToastProvider';
import {
	LOGIN_CREATEUSER,
	NC_STATUS_CODE,
	WHITELABEL_ENCRYPTION_API,
} from '../../../_config/app.config';
import { APP_CLIENT } from '../../../_config/app.config';

const Div = styled.div`
	flex: 1;
	padding: 50px;
	background: #ffffff;
	@media (max-width: 700px) {
		padding: 50px 0px;
	}
`;

const ButtonWrap = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;

function formatUserDetails(data, fields) {
	let formatedData = {};
	fields.forEach(f => {
		formatedData[f.name] = data[f.name] || '0';
	});
	return formatedData;
}

const valueConversion = {
	Thousand: 1000,
	Thousands: 1000,
	Lakhs: 100000,
	Crores: 10000000,
	Millions: 1000000,
	One: 1,
};

export default function PersonalDetailsPage({ id, map, onFlowChange }) {
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);
	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: { setUsertypeApplicantData, setUsertypeBankData },
	} = useContext(FormContext);

	const {
		state: { userBankDetails, userToken },
		actions: { setUserDetails, setUserId },
	} = useContext(UserContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();
	const { newRequest } = useFetch();

	const amountConverter = (value, k) => {
		if (k) return value * valueConversion[k || 'One'];
		return value;
	};

	const onSave = async data => {
		if (!userToken) {
			const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
				method: 'POST',
				data: {
					email: data.email,
					white_label_id: whiteLabelId,
					source: APP_CLIENT,
					name: data.firstName,
					mobileNo: data.mobileNo,
					addrr1: '',
					addrr2: '',
				},
			});

			const userDataRes = userDetailsReq.data;

			if (userDataRes.statusCode === NC_STATUS_CODE.NC200) {
				localStorage.setItem('userToken', userDataRes.token);

				const encryptWhiteLabelReq = await newRequest(
					WHITELABEL_ENCRYPTION_API,
					{
						method: 'GET',
					},
					{ Authorization: `Bearer ${userDataRes.token}` }
				);

				const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

				localStorage.setItem(
					'encryptWhiteLabel',
					encryptWhiteLabelRes.encrypted_whitelabel[0]
				);
			}

			const userData = {
				// userAccountToken: userDetailsReq.accToken,
				// userDetails: userDetailsReq.userDetails,
				// userBankDetails: userDetailsReq.cubDetails,
				bankId: userDataRes.bankId,
				branchId: userDataRes.branchId,
				userToken: userDataRes.token,
			};
			setUserId(userDataRes.userId);
			setUserDetails(userData);
			setUsertypeBankData({
				bankId: userDataRes.bankId,
				branchId: userDataRes.branchId,
			});
		}

		setUsertypeApplicantData({
			...data,
			isApplicant: '1',
			...formatUserDetails(data, map.fields['salary-details'].data),
		});
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const onProceed = data => {
		if (
			Number(formState?.values?.grossIncome) === 0 ||
			Number(formState?.values?.netMonthlyIncome) === 0
		) {
			return addToast({
				message: 'Income cannot be 0',
				type: 'error',
			});
		} else {
			const formstatepan = JSON.parse(localStorage.getItem('formstatepan'));
			localStorage.setItem(
				'formstatepan',
				JSON.stringify({ ...formstatepan, ...data })
			);
			const formstate = JSON.parse(localStorage.getItem('formstate'));
			localStorage.setItem(
				'formstate',
				JSON.stringify({ ...formstate, ...data })
			);
			onSave(data);
			setCompleted(id);
			onFlowChange(map.main);
		}
	};

	const formatPersonalDetails = personalDetails => {
		return {
			firstName: personalDetails?.businessname,
			incomeType: personalDetails?.businesstype,
			lastName: personalDetails?.last_name,
			pan: personalDetails?.businesspancardnumber,
			dob: personalDetails?.businessstartdate
				? personalDetails?.businessstartdate.split(' ')[0]
				: '',
			aadhaar: personalDetails?.relation,
			mobileNum: personalDetails?.contactno,
			residentTypess: personalDetails?.relation,
			email: personalDetails?.business_email,
			countryResidence: personalDetails?.relation,
			maritalStatus: personalDetails?.relation,
		};
	};

	const r = () => {
		const editLoanData = JSON.parse(localStorage.getItem('editLoan'));
		const appData = JSON.parse(userTokensss)?.formReducer?.user?.applicantData;
		if (APP_CLIENT.includes('clix') || APP_CLIENT.includes('nctestnew')) {
			let form =
				(appData && Object.keys(appData).length > 0 && appData) ||
				formatPersonalDetails(editLoanData?.business_id) ||
				{};
			if (form) return form;
			else {
				var formStat = JSON.parse(localStorage.getItem('formstate'));
				return formStat?.values;
			}
		} else {
			let form =
				(Object.keys(JSON.parse(userTokensss)?.formReducer?.user?.applicantData)
					.length > 0 &&
					JSON.parse(userTokensss)?.formReducer?.user?.applicantData) ||
				formatPersonalDetails(editLoanData.business_id) ||
				{};

			if (form) return form;
			else return userBankDetails;
		}
	};

	const getAdhar = () => {
		if (APP_CLIENT.includes('clix') || APP_CLIENT.includes('nctestnew')) {
			var formStat =
				JSON.parse(localStorage.getItem('formstate'))?.values?.aadharNum ||
				localStorage.getItem('aadhar');

			if (formStat) {
				const adharNum = formStat;

				let d = `xxxxxxxx${adharNum[adharNum.length - 4]}${
					adharNum[adharNum.length - 3]
				}${adharNum[adharNum.length - 2]}${adharNum[adharNum.length - 1]}`;

				return `${d}`;
			}
		} else {
			return userBankDetails?.aadharNum;
		}
	};

	const getDOB = () => {
		if (APP_CLIENT.includes('clix') || APP_CLIENT.includes('nctestnew')) {
			var formStat =
				JSON.parse(localStorage.getItem('formstate')) ||
				JSON.parse(localStorage.getItem('formstatepan'));

			if (formStat && formStat?.values?.dob) {
				let d = formStat.values.dob.split('/');

				d = `${d[2]}-${d[1]}-${d[0]}`;

				return d;
			}
		} else {
			return userBankDetails?.dob;
		}
	};

	const url = window.location.hostname;

	let userTokensss = localStorage.getItem(url);

	let loan = JSON.parse(userTokensss).formReducer?.user?.loanData;
	let form = JSON.parse(userTokensss).formReducer?.user?.applicantData;

	const getDataFromPan = () => {
		const t = JSON.parse(localStorage.getItem('formstatepan'));
		const name = t?.values?.companyName?.split(' ');
		if (name) {
			return name;
		}
	};
	const editLoanData = JSON.parse(localStorage.getItem('editLoan'));
	let editLoanDataSalary = {};
	if (editLoanData && (!form || (form && Object.keys(form).length === 0))) {
		editLoanDataSalary = {
			grossIncome:
				editLoanData.annual_turn_over &&
				amountConverter(
					editLoanData.annual_turn_over,
					editLoanData.revenue_um
				).toString(),

			netMonthlyIncome:
				editLoanData.annual_op_expense &&
				amountConverter(
					editLoanData.annual_op_expense,
					editLoanData.op_expense_um
				).toString(),
		};
	}
	return (
		<Div>
			<PersonalDetails
				register={register}
				formState={formState}
				preData={{
					firstName:
						r()?.firstName || (getDataFromPan() && getDataFromPan()[0]) || '',
					lastName:
						r()?.lastName || (getDataFromPan() && getDataFromPan()[1]) || '',
					dob:
						getDOB() ||
						JSON.parse(localStorage.getItem('formstatepan'))?.values?.dob ||
						r()?.dob ||
						'',
					email: r()?.email || '',
					mobileNo: r()?.mobileNum || '',
					panNumber:
						r()?.pan ||
						JSON.parse(localStorage.getItem('formstatepan'))?.values
							?.panNumber ||
						localStorage.getItem('pan') ||
						'',
					residenceStatus: r()?.residentTypess || '',
					aadhaar: getAdhar() || r()?.aadhar || '',
					countryResidence: r()?.countryResidence || 'india',
					...form,
				}}
				jsonData={map?.fields[id]?.data}
			/>
			<SalaryDetails
				jsonData={map?.fields['salary-details'].data}
				register={register}
				formState={formState}
				incomeType={formState?.values?.incomeType || null}
				preData={form || editLoanDataSalary}
			/>
			<ButtonWrap>
				<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
			</ButtonWrap>
		</Div>
	);
}

PersonalDetailsPage.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};
