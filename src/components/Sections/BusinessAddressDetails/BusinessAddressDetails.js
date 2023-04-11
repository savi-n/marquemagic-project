import React, { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import axios from 'axios';

import Button from 'components/Button';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getCompletedSections,
	isFieldValid,
} from 'utils/formatData';
import useForm from 'hooks/useForm';
import { useToasts } from 'components/Toast/ToastProvider';
// import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';
import Loading from 'components/Loading';

const BusinessAddressDetails = props => {
	const { app, application } = useSelector(state => state);
	const { businessAddressIdAid1 } = application;
	const {
		isDraftLoan,
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		isTestMode,
		selectedSection,
		isLocalhost,
		// clientToken,
		editLoanDirectors,
	} = app;

	let { isViewLoan, isEditLoan, isEditOrViewLoan } = app;
	const [loading, setLoading] = useState(false);
	const { addToast } = useToasts();
	const [businessAddress, setBusinessAddress] = useState({});

	// ---------------------------------------------------------- GSTData API starts (for now hard-coding the data) --------------------------------------------
	//TODO: api call for gst -> address and get Request for fetching list of GSTs

	// if there is single line of ROC address, then from there to extract pincode, using this
	const ROC_Addr =
		'BLOCK NO. 305 & 330, VILLAGE ZAK, VEHLAL ROAD, OFF NARODA-DEHGAM ROADM, TAL DEHGAM DIST GANDHINAGAR GJ 382330 IN';
	const pinRegex = /\b\d{6}\b/; // regex to match 6-digit pin code
	let pincodeFromRocAddress = ROC_Addr.match(pinRegex)[0];

	// const GST = '29AABCT3518Q1ZS';
	// const GST_ADDR_FETCH_URL = `${API.ENDPOINT_BANK}/GSTData`; // API endpoint to fetch address from Gst Number selected in Business Details page

	useEffect(() => {
		// const fetchAddressFromGstNum = async gstin => {
		// 	try {
		// 		const gstAddressReqBody = {
		// 			gst: gstin,
		// 		};
		// 		setLoading(true);
		// 		const addrResponse = await axios.post(
		// 			GST_ADDR_FETCH_URL,
		// 			gstAddressReqBody,
		// 			{
		// 				headers: {
		// 					Authorization: clientToken,
		// 				},
		// 			}
		// 		);
		// 		console.log(
		// 			'🚀 ~ file: BusinessAddressDetails.js:71 ~ fetchAddressFromGstNum ~ addrResponse:',
		// 			addrResponse
		// 		);

		// set the business address based on the pradr of the response of the above api call

		const newAddress = {
			address1: ROC_Addr,
			address2: '',
			address3: '',
		};
		// setBusinessAddress(addrResponse?.data?.data?.pradr?.addr);
		setBusinessAddress(newAddress);
		setTimeout(() => {
			onChangeFormStateField({
				name: 'pin_code',
				value: pincodeFromRocAddress,
			});
		}, 0);
		// 	} catch (error) {
		// 		console.error('error-AddressDetails-onProceed-', {
		// 			error: error,
		// 			res: error?.response,
		// 			resres: error?.response?.response,
		// 			resData: error?.response?.data,
		// 		});
		// 		addToast({
		// 			message: getApiErrorMessage(error),
		// 			type: 'error',
		// 		});
		// 	} finally {
		// 		setLoading(false);
		// 	}
		// };
		// fetchAddressFromGstNum(GST);

		// eslint-disable-next-line
	}, []);
	// ---------------------------------------------------------- GSTData API ends ---------------------------------------------------------------------
	if (isDraftLoan) {
		isViewLoan = false;
		isEditLoan = false;
		isEditOrViewLoan = false;
	}
	const dispatch = useDispatch();
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const completedSections = getCompletedSections({
		selectedProduct,
		application,
		isEditOrViewLoan,
		isEditLoan,
		editLoanDirectors,
	});
	const isSectionCompleted = completedSections.includes(selectedSectionId);

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};
	const onProceed = async () => {
		try {
			if (!formState?.values?.city || !formState?.values?.state) {
				return addToast({
					message: 'Please enter valid pincode to get city and state',
					type: 'error',
				});
			}
			setLoading(true);
			const newBusinessAddressDetails = [
				{
					business_address_id: businessAddressIdAid1,
					aid: 1,
					address1: formState?.values?.address1 || '',
					address2: formState?.values?.address2 || '',
					address3: formState?.values?.address3 || '',
					pin_code: formState?.values?.pin_code || '',
					city: formState?.values?.city || '',
					state: formState?.values?.state || '',
				},
			];

			const businessAddressDetailReqBody = formatSectionReqBody({
				app,
				application,
				values: formState.values,
			});

			businessAddressDetailReqBody.data.business_address_details = newBusinessAddressDetails;

			// const businessAddressDetailRes = await axios.post(
			// 	`${API.API_END_POINT}/basic_details`,
			// 	businessAddressDetailReqBody
			// );

			// const newAddressDetails = {
			// 	sectionId: selectedSectionId,
			// 	sectionValues: formState.values,
			// };
			// dispatch(
			// 	setLoanIds({
			// 		businessAddressIdAid1: addressDetailsRes?.data?.data?.business_address_data?.filter(
			// 			address => address.aid === 1
			// 		)?.[0]?.id,
			// 		// businessAddressIdAid2: addressDetailsRes?.data?.data?.business_address_data?.filter(
			// 		// 	address => address.aid === 2
			// 		// )?.[0]?.id,
			// 	})
			// );
			// dispatch(updateApplicantSection(newAddressDetails));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-AddressDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	const populatePreData = field => {
		const preData = {
			address1: businessAddress?.address1,
			address2: businessAddress?.address2,
			address3: businessAddress?.address3,
			// pin_code: businessAddress?.pncd,
			// city: businessAddress?.city,
			// state: businessAddress?.state,
		};
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
		console.log(businessAddress);
		try {
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE
			let editViewLoanValue = populatePreData(field);

			// if (isEditOrViewLoan) {
			// 	editViewLoanValue = prefilledEditOrViewLoanValues(field);
			// }

			if (editViewLoanValue) return editViewLoanValue;

			// return field?.value || populateGstAddressData(field) || '';
			return field?.value || '';
		} catch (error) {
			console.error(error);
			return {};
		}
	};

	return loading ? (
		<Loading />
	) : (
		<UI_SECTIONS.Wrapper>
			{selectedSection?.sub_sections?.map((sub_section, subSectionIndex) => {
				return (
					<Fragment key={`section-${subSectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<UI.H1>{`${sub_section.name.slice(
								0,
								18
							)} Business ${sub_section.name.slice(18)}`}</UI.H1>
						) : null}

						<UI.FormWrapGrid>
							<UI.Coloum>
								{sub_section?.fields?.map((field, fieldIndex) => {
									if (!isFieldValid({ field, formState })) {
										return null;
									}

									const newValue = prefilledValues(field);
									const customFieldProps = {};
									if (isViewLoan) {
										customFieldProps.disabled = true;
									}
									const customStyle = {};

									if (isSectionCompleted) {
										customFieldProps.disabled = true;
									}

									// TO overwrite all above condition and disable everything
									if (isViewLoan) {
										customFieldProps.disabled = true;
									}

									// in all the scenario this fields will be always disabled
									if (
										field.name.includes('city') ||
										field.name.includes('state')
									) {
										customFieldProps.disabled = true;
									}

									return (
										<UI.FieldWrapGrid
											field={field}
											key={`field-${fieldIndex}-${field.name}`}
											style={customStyle}
										>
											{register({
												...field,
												value: newValue,
												visibility: 'visible',
												...customFieldProps,
											})}
											{(formState?.submit?.isSubmited ||
												formState?.touched?.[field.name]) &&
												formState?.error?.[field.name] && (
													<UI_SECTIONS.ErrorMessage>
														{formState?.error?.[field.name]}
													</UI_SECTIONS.ErrorMessage>
												)}
										</UI.FieldWrapGrid>
									);
								})}
							</UI.Coloum>
						</UI.FormWrapGrid>
					</Fragment>
				);
			})}
			<UI_SECTIONS.Footer>
				{!isViewLoan && (
					<Button
						fill
						name='Save and Proceed'
						isLoader={loading}
						disabled={loading}
						onClick={handleSubmit(onProceed)}
					/>
				)}
				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}

				{!isViewLoan && (isLocalhost && !!isTestMode) && (
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
				)}
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default BusinessAddressDetails;
