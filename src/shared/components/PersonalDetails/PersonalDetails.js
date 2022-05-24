// Active Help us with your PAGE
// Guarantor Personal Details
// Help us with your Business Details
// Help us with your Personal Details
import { useEffect, useContext } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { array, func, object, oneOfType, string } from 'prop-types';
import useFetch from 'hooks/useFetch';
import { useToasts } from 'components/Toast/ToastProvider';
import { AppContext } from 'reducer/appReducer';
import {
	NC_STATUS_CODE,
	SEARCH_BANK_BRANCH_LIST,
	AADHAAR_GENERATE_OTP,
} from '_config/app.config';
import { UserContext } from 'reducer/userReducer';
import { FlowContext } from 'reducer/flowReducer';
import InputField from 'components/inputs/InputField';
import moment from 'moment';
import Button from '../../../components/Button';
import AadhaarOTPModal from '../AadhaarOTPModal/AadhaarOtpModal';
import { LoanFormContext } from '../../../reducer/loanFormDataReducer';

const H = styled.h1`
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const FieldWrap = styled.div`
	width: ${({ isSmallSize }) => (isSmallSize ? '25%' : '45%')};
	/* width: 25%; */
	display: ${({ isSubFields }) => (isSubFields ? 'flex' : 'block')};
	gap: ${({ isSubFields }) => (isSubFields ? '10px' : '0')};
	margin: 15px 0;
	@media (max-width: 700px) {
		width: 100%;
	}
`;

const FormWrap = styled.div`
	position: relative;
	display: flex;
	/* align-items: center; */
	flex-wrap: wrap;
	gap: 10%;
	margin: 20px 0;
	justify-content: space-between;
	/* flex-flow: wrap column; */
	/* max-height: 400px; */
`;

const ErrorMessageSubFields = styled.div`
	position: absolute;
	width: 45%;
	margin-top: 50px;
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;
const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;

const PricePerAcer = styled.div`
	font-size: 14px;
	color: grey;
	text-align: center;
`;

const TotalValueWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: end;
	margin-bottom: 10px;
	label {
		padding-right: 30px;
	}
`;

export default function PersonalDetails({
	preData = {},
	id,
	pageName,
	userType,
	jsonData,
	register,
	formState,
	companyDetail,
}) {
	const { state } = useContext(LoanFormContext);
	const {
		state: { bankId, userToken },
	} = useContext(UserContext);
	const {
		state: { clientToken },
	} = useContext(AppContext);
	const {
		state: { completed: completedSections },
	} = useContext(FlowContext);
	const { newRequest } = useFetch();

	const { addToast } = useToasts();

	const arrPricePerAcer = [0, 0, 0];
	const arrTotalValueCultivated = [0, 0, 0];
	const numberVar = ['1', '2', '3'];

	const [isAadhaarOtpModalOpen, setIsAadhaarOtpModalOpen] = useState(false);
	const [generateOtpResponse, setGenerateOtpResponse] = useState('');
	const [isVerifyWithOtpDisabled, setIsVerifyWithOtpDisabled] = useState(false);
	// const aadhaar = '';
	let aadhaar =
		formState?.values?.aadhaar || sessionStorage.getItem('aadhar') || '';
	// let aadhaar = formState?.values?.aadhaar || '';

	if (aadhaar.includes('x') || aadhaar.includes('X')) {
		aadhaar = preData.aadhaarUnMasked;
	}

	const populateValue = field => {
		if (!userType && field.disabled) {
			return preData?.[field.name] || '';
		}

		if (formState?.values?.[field.name] !== undefined) {
			return formState?.values?.[field.name];
		}
		return preData?.[field.name] || field.value || '';
		// companyDetail
		// 	? companyDetail?.[field.name]
		// 	:
	};

	const getHomeBranchOption = async () => {
		const opitionalDataReq = await newRequest(
			SEARCH_BANK_BRANCH_LIST({ bankId }),
			{},
			{
				Authorization: `Bearer ${userToken}`,
			}
		);

		const opitionalDataRes = opitionalDataReq.data;
		if (opitionalDataRes.statusCode === NC_STATUS_CODE.NC200) {
			return opitionalDataRes.branchList
				.map(branch => ({
					name: branch.branch,
					value: String(branch.id),
				}))
				.sort((a, b) => a.name.localeCompare(b.name));
		}
	};

	useEffect(() => {
		jsonData.map(field => {
			if (field.name === 'dob') {
				field.placeholder = 'Date of Birth';
			}
			if (field.name === 'aadhar') {
			}
			return null;
		});

		if (id === 'business-details') {
			let isMobilePresent,
				isEmailPresent = false;
			jsonData.map(ele => {
				if (ele.name === 'mobileNo') {
					isMobilePresent = true;
				}
				if (ele.name === 'Email') {
					isEmailPresent = true;
				}
				return null;
			});
			const mo = {
				name: 'mobileNo',
				options: [],
				rules: { required: true, length: 10 },
				placeholder: 'Mobile Number',
				mask: { NumberOnly: true, CharacterLimit: 10 },
				type: 'text',
				visibility: true,
			};
			const email = {
				name: 'Email',
				options: [],
				rules: { required: true, email: true },
				placeholder: 'Email',
				type: 'text',
				visibility: true,
			};
			!isMobilePresent && jsonData.push(mo);
			!isEmailPresent && jsonData.push(email);
		}

		if (sessionStorage.getItem('aadhaar_otp_res')) {
			setIsVerifyWithOtpDisabled(true);
		}
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (pageName === 'Business Details') {
			let isMobilePresent,
				isEmailPresent = false;
			jsonData.map(ele => {
				if (ele.name === 'mobileNo') {
					isMobilePresent = true;
				}
				if (ele.name === 'Email') {
					isEmailPresent = true;
				}
				return null;
			});
			const mo = {
				name: 'mobileNo',
				options: [],
				rules: { required: true, length: 10 },
				placeholder: 'Mobile Number',
				mask: { NumberOnly: true, CharacterLimit: 10 },
				type: 'text',
				visibility: true,
			};
			const email = {
				name: 'Email',
				options: [],
				rules: { required: true, email: true },
				placeholder: 'Email',
				type: 'text',
				visibility: true,
			};
			!isMobilePresent && jsonData.push(mo);
			!isEmailPresent && jsonData.push(email);
		}
		// eslint-disable-next-line
	}, [pageName]);

	const onSubFieldButtonClick = async () => {
		if (!aadhaar) {
			return addToast({
				message: 'Please enter aadhaar number',
				type: 'error',
			});
		}
		if (aadhaar.length !== 12) {
			return addToast({
				message: 'Aadhar number should be 12 digit',
				type: 'error',
			});
		}
		const invalidStart = [0, 1, '0', '1'];
		if (invalidStart.includes(aadhaar[0])) {
			return addToast({
				message: 'Invalid aadhaar number',
				type: 'error',
			});
		}
		const regexForNumber = /^[0-9\b]+$/;
		if (!regexForNumber.test(aadhaar)) {
			return addToast({
				message: 'Aadhaar number should not contain alphabets',
				type: 'error',
			});
		}
		try {
			setIsAadhaarOtpModalOpen(true);
			sessionStorage.setItem('aadhar', aadhaar);
			const aadharOtpReq = await newRequest(AADHAAR_GENERATE_OTP, {
				method: 'POST',
				data: {
					aadhaarNo: aadhaar,
				},
				headers: {
					Authorization: `${clientToken}`,
				},
			});
			const aadhaarGenOtpResponse = aadharOtpReq.data;

			if (aadhaarGenOtpResponse.status === 'ok') {
				aadhaarGenOtpResponse.aadhaarNo = aadhaar;
				setGenerateOtpResponse(aadhaarGenOtpResponse);
			} else {
				setIsAadhaarOtpModalOpen(false);
			}
		} catch (error) {
			console.log(error);
			console.log(error.response);
			addToast({
				message:
					error?.response?.data?.message ||
					'Aadhaar cannot be validated due to technical failure. Please try again after sometime',
				type: 'error',
			});
		}
	};

	// console.log('PersonalDetails-PreData-', preData);

	return (
		<>
			{isAadhaarOtpModalOpen && (
				<AadhaarOTPModal
					isAadhaarOtpModalOpen={isAadhaarOtpModalOpen}
					setIsAadhaarOtpModalOpen={setIsAadhaarOtpModalOpen}
					aadhaarGenOtpResponse={generateOtpResponse}
					setIsVerifyWithOtpDisabled={setIsVerifyWithOtpDisabled}
				/>
			)}
			<H>
				{userType || 'Help us with your'}{' '}
				<span>{pageName || 'Personal Details'}</span>
			</H>
			<FormWrap>
				{jsonData && id === 'business-details'
					? jsonData.map(field => {
							const editLoanData = JSON.parse(
								sessionStorage.getItem('editLoan')
							);
							const customFields = {};
							if (field.name === 'BusinessType') {
								if (
									completedSections.includes('business-details') ||
									(editLoanData && editLoanData?.loan_ref_id)
								) {
									customFields.readonly = true;
									customFields.disabled = true;
								}
							}
							return (
								field.visibility && (
									<>
										<FieldWrap key={field.name}>
											{register({
												...field,
												value: populateValue(field),
												...(preData?.[field.name] &&
													field?.preDataDisable && { disabled: true }),
												...(userType ? { disabled: false } : {}),
												max: field.type === 'date' && '9999-12-31',
												...customFields,
											})}
											{(formState?.submit?.isSubmited ||
												formState?.touched?.[field.name]) &&
												formState?.error?.[field.name] &&
												(field.subFields ? (
													<ErrorMessageSubFields>
														{formState?.error?.[field.name]}
													</ErrorMessageSubFields>
												) : (
													<ErrorMessage>
														{formState?.error?.[field.name]}
													</ErrorMessage>
												))}
										</FieldWrap>
									</>
								)
							);
					  })
					: id !== 'business-details' &&
					  jsonData.map(field => {
							// console.log('field-', field);
							const editLoanData = JSON.parse(
								sessionStorage.getItem('editLoan')
							);
							const value = populateValue(field);
							const customFields = {};
							if (pageName === 'Bank Details') {
								const startDateValue = populateValue(
									jsonData.filter(f => f.name === 'StartDate')[0]
								);
								// console.log('startDateValue-', startDateValue);
								if (field.name === 'EndDate' && startDateValue) {
									customFields.min = moment(startDateValue).format(
										'YYYY-MM-DD'
									);
								}
								if (field.name === 'StartDate' || field.name === 'EndDate') {
									customFields.max = moment().format('YYYY-MM-DD');
								}
							}

							if (id === 'personal-details' && field.name === 'incomeType') {
								if (
									completedSections.includes('personal-details') ||
									(editLoanData && editLoanData?.loan_ref_id)
								) {
									customFields.readonly = true;
									customFields.disabled = true;
								}
							}

							let pricePerAcer = 0;
							if (
								field?.options?.[0]?.peracre &&
								formState?.values?.[field.name]
							) {
								const fieldNameNumber = field.name.slice(-1);
								pricePerAcer = field.options.filter(
									o => o.value === formState.values[field.name]
								)[0].peracre;
								if (numberVar.includes(fieldNameNumber))
									arrPricePerAcer[fieldNameNumber] = pricePerAcer;
							}
							let totalValueCultivated = 0;
							if (
								field?.name.includes('cultivated') &&
								formState?.values?.sq_feet
							) {
								const fieldNameNumber = field.name.slice(-1);
								totalValueCultivated = Math.round(
									(formState?.values?.sq_feet *
										arrPricePerAcer[fieldNameNumber] *
										formState.values?.[field.name]) /
										100,
									2
								);
								if (numberVar.includes(fieldNameNumber))
									arrTotalValueCultivated[
										fieldNameNumber
									] = totalValueCultivated;
							}
							if (
								field?.name.includes('aadhaar') &&
								(id === 'personal-details' || id === 'business-details')
							) {
								if (
									state?.documents?.filter(d => d.req_type === 'aadhar')
										?.length >= 1
								) {
									customFields.disabled =
										isVerifyWithOtpDisabled || preData?.aadhaar?.length === 12;
									customFields.readonly =
										isVerifyWithOtpDisabled || preData?.aadhaar?.length === 12;
								} else {
									customFields.disabled = isVerifyWithOtpDisabled;
									customFields.readonly = isVerifyWithOtpDisabled;
								}
							}
							return (
								field.visibility && (
									<>
										<FieldWrap
											key={field.name}
											isSmallSize={
												field.name.includes('crop') ||
												field.name.includes('cultivated')
											}
											isSubFields={field?.subFields ? true : false}>
											{register({
												...field,
												value,
												...(preData?.[field.name] &&
													field?.preDataDisable && { disabled: true }),
												...(userType ? { disabled: false } : {}),
												max: field.type === 'date' && '9999-12-31',
												placeholder:
													field.type === 'banklist'
														? preData?.[`${field.name}`]?.name ||
														  field.placeholder
														: field.type === 'search'
														? preData?.branchIdName || field.placeholder
														: field.placeholder,
												...(field.type === 'search'
													? {
															searchable: true,
															...(field.fetchOnInit && {
																fetchOptionsFunc: getHomeBranchOption,
															}),
													  }
													: {}),
												...customFields,
											})}
											{field?.subFields &&
												field?.subFields.map(subF => {
													if (subF.type === 'button') {
														return (
															<Button
																name={subF.placeholder}
																disabled={isVerifyWithOtpDisabled}
																type='submit'
																customStyle={{ whiteSpace: 'nowrap' }}
																onClick={onSubFieldButtonClick}
															/>
														);
													} else return null;
													// Different types of field should come as seperate requriement
													// during that time we'll handle these scenarion
													// now only button is handled
												})}
											{(formState?.submit?.isSubmited ||
												formState?.touched?.[field.name]) &&
												formState?.error?.[field.name] &&
												(field.subFields ? (
													<ErrorMessageSubFields>
														{formState?.error?.[field.name]}
													</ErrorMessageSubFields>
												) : (
													<ErrorMessage>
														{formState?.error?.[field.name]}
													</ErrorMessage>
												))}
											{pricePerAcer > 0 && (
												<PricePerAcer>
													Rs. {pricePerAcer}
													/acre
												</PricePerAcer>
											)}
											{totalValueCultivated > 0 && (
												<PricePerAcer>Rs. {totalValueCultivated}</PricePerAcer>
											)}
										</FieldWrap>
									</>
								)
							);
					  })}
			</FormWrap>
			{id === 'land-additional-details' && (
				<TotalValueWrapper>
					<label>Total Value: Rs.</label>
					<InputField
						readonly
						disabled
						placeholder='Value'
						value={arrTotalValueCultivated.reduce((a, b) => a + b, 0)}
						style={{ width: '100%' }}
						id={id}
					/>
				</TotalValueWrapper>
			)}
		</>
	);
}

PersonalDetails.propTypes = {
	preData: object,
	register: func.isRequired,
	jsonData: oneOfType([array, object]),
	userType: string,
	formState: object,
};
