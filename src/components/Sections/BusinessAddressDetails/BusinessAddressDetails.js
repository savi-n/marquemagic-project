import React, { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Button from 'components/Button';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getCompletedSections,
	isFieldValid,
} from 'utils/formatData';
import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';
import Loading from 'components/Loading';
import { updateApplicationSection, setLoanIds } from 'store/applicationSlice';
import { extractPincode } from 'utils/helper';

const BusinessAddressDetails = props => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const { businessId } = application;

	const {
		isDraftLoan,
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		isTestMode,
		selectedSection,
		isLocalhost,
		clientToken,
		userToken,
		editLoanDirectors,
	} = app;

	let { isViewLoan, isEditLoan, isEditOrViewLoan } = app;
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

	const [loading, setLoading] = useState(false);
	const [fetchingGstAddress, setFetchingGstAddress] = useState(false);
	const { addToast } = useToasts();

	const selectedLoanProductId = selectedProduct?.product_id?.['business'] || '';
	const [sectionData, setSectionData] = useState([]);
	const [gstAndUan, setGstAndUan] = useState({});
	const [gstNumbers, setGstNumbers] = useState([]);

	/*
	--------------------------------------------------- /business_address_details GET API  --------------------------------------------
		api cal for -> To get existing address if there is any along with all the GST numbers connected to the business pan card and then populate the fields


			-> We should always call /business_address_details api when the page renders, be it in edit or view loan or while applying.
			-> From there we should get address in response with pan.
			-> Populate the address fields(form inputs) with the received address, if there is any. Else keep fields blank and let user fill manually
	*/
	const fetchBusinessAddressDetails = async () => {
		try {
			setLoading(true);
			const fetchRes = await axios.get(
				`${API.BUSINESS_ADDRESS_DETAILS}?business_id=${businessId}`,
				{
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				}
			);
			// setBusinessAddressResp(businessAddressResponse?.data?.data);
			// invoke the fetchAllGstNumbers as we have received pan from the above resp
			// console.log({ fetchRes });
			if (fetchRes?.data?.status === 'ok') {
				const address = fetchRes?.data?.data?.address;
				setSectionData(address);

				setGstAndUan({
					gst: fetchRes?.data?.data?.gstin,
					uan: fetchRes?.data?.data?.udyam_number,
				});
				fetchAllGstNumbers(fetchRes?.data?.data?.pan);
				// populateFromResponse(address);
			}
		} catch (error) {
			console.error('error-BusinessAddressDetails', {
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

	useEffect(() => {
		fetchBusinessAddressDetails();
		// eslint-disable-next-line
	}, []);
	//  /business_address_details GET API ends

	/*
			 /panToGst API function starts (invoked in above useEffect)

			-> We get pan number in the above get /business_address_details API, Use that pan number to fetch all the GST numbers associated with that pan number
			-> After getting response, set all the gstNumbers to a state, which will be later converted into options to be passed to Gst dropdown.
	*/

	const fetchAllGstNumbers = async panNum => {
		if (panNum) {
			try {
				setLoading(true);
				const { data } = await axios.post(
					`${API.API_END_POINT}/api/panToGst`,
					{
						pan: panNum,
					},
					{
						headers: {
							Authorization: clientToken,
						},
					}
				);
				setGstNumbers(data?.data);
			} catch (error) {
				console.error('error-BusinessAddressDetails', {
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
		}
	};

	// since we are getting an object, convert to an array of options with name and value so that it can be passed to an dropdown
	const gstOptions = gstNumbers?.map(gstNum => {
		return {
			name: `${gstNum.gstin} - ${gstNum.state_name} - ${gstNum.status}`,
			value: gstNum.gstin,
		};
	});
	// -> /panToGst API ends

	/*
			--> /GSTData API starts
			-> We call this API /GSTData every time the user selects a new value(GST number) from the dropdown.
			-> In response we get gst details and one address, this address needed to be populated into the form fields, for that set the received
			address value into the above bussinessAddressResp.address array

	*/
	const handleGstChange = async gstinValue => {
		if (gstinValue) {
			try {
				setFetchingGstAddress(true);
				const gstAddressResponse = await axios.post(
					`${API.ENDPOINT_BANK}/GSTData`,

					{
						gst: gstinValue,
					},
					{
						headers: {
							Authorization: clientToken,
						},
					}
				);

				const newAddress = {
					line1: gstAddressResponse?.data?.data?.pradr?.addr?.bnm || '',
					line2: gstAddressResponse?.data?.data?.pradr?.addr?.bno || '',
					line3: gstAddressResponse?.data?.data?.pradr?.addr?.st || '',
					pincode: gstAddressResponse?.data?.data?.pradr?.addr?.pncd || '',
				};

				populateFromResponse(newAddress);

				// setBusinessAddressResp(businessAddressResp => {
				// 	businessAddressResp.address = [...newAddress];
				// });
			} catch (error) {
				console.error('error-BusinessAddressDetails', {
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
				// populateFromResponse(businessAddressResp?.address);
				setFetchingGstAddress(false);
			}
		}
	};

	useEffect(() => {
		handleGstChange(formState?.values?.select_gstin);
		// eslint-disable-next-line
	}, [formState?.values?.select_gstin]);

	// populate address fields with response value
	const populateFromResponse = businessAddress => {
		// console.log({ businessAddress });
		setTimeout(() => {
			onChangeFormStateField({
				name: 'pin_code',
				value:
					+businessAddress?.pincode ||
					extractPincode(businessAddress?.line1) || // if there is single line of ROC address,
					'',
			});
			onChangeFormStateField({
				name: 'address1',
				value: businessAddress?.line1 || '',
			});

			if (businessAddress?.line2) {
				onChangeFormStateField({
					name: 'address2',
					value: businessAddress?.line2 || '',
				});
			}

			if (businessAddress?.line3) {
				onChangeFormStateField({
					name: 'address3',
					value: businessAddress?.line3 || '',
				});
			}
		}, 0);
	};

	const isSectionCompleted = completedSections?.includes(selectedSectionId);

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

			const businessAddressDetailReqBody = formatSectionReqBody({
				section: selectedSection,
				app,
				application,
				values: formState?.values,
				applicantCoApplicants,
				selectedLoanProductId,
			});

			// console.log({
			// 	businessAddressDetailReqBody,
			// 	selectedProduct,
			// 	selectedLoanProductId,
			// 	formState,
			// });
			// temp changes starts(toberemoved)
			const tempAddress = [];
			businessAddressDetailReqBody.data.gstin =
				formState?.values?.['select_gstin'];
			businessAddressDetailReqBody.data.business_address_details.aid = 1;
			tempAddress?.push(
				businessAddressDetailReqBody?.data?.business_address_details
			);
			businessAddressDetailReqBody.data.business_address_details = tempAddress;
			// delete businessAddressDetailReqBody?.data?.address_details;
			// temp changes ends
			const businessAddressDetailRes = await axios.post(
				API.BUSINESS_ADDRESS_DETAILS,
				businessAddressDetailReqBody
			);

			dispatch(
				setLoanIds({
					businessAddressIdAid1: businessAddressDetailRes?.data?.data?.business_address_data?.filter(
						address => address.aid === 1
					)?.[0]?.id,
					businessAddressIdAid2: businessAddressDetailRes?.data?.data?.business_address_data?.filter(
						address => address.aid === 2
					)?.[0]?.id,
				})
			);
			const newAddressDetails = {
				sectionId: selectedSectionId,
				sectionValues: {
					...formState?.values,
				},
			};
			dispatch(updateApplicationSection(newAddressDetails));
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

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(application?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const prefilledValues = field => {
		try {
			const address = sectionData?.filter(address => address?.aid === 1)?.[0];
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			// console.log({
			// 	field,
			// 	sectionData,
			// 	value: address?.[field?.db_key],
			// 	key: field?.db_key,
			// 	gstAndUan,
			// 	gstUan: !gstAndUan?.uan,
			// });
			if (field?.name === 'select_gstin') return gstAndUan?.gst;

			return address?.[field?.db_key];
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
						{sub_section?.name ? <UI.H1>{sub_section?.name}</UI.H1> : null}

						<UI.FormWrapGrid>
							<UI.Coloum>
								{sub_section?.fields?.map((field, fieldIndex) => {
									if (!isFieldValid({ field, formState })) {
										return null;
									}

									const newValue = prefilledValues(field);
									const customFieldProps = {};

									if (field.name === 'select_gstin') {
										customFieldProps.isGSTselector = true;
										customFieldProps.options = gstOptions;
									}

									if (field.name === 'select_gstin' && gstAndUan?.uan) {
										return null;
									}

									const customStyle = {};
									if (isSectionCompleted) {
										customFieldProps.disabled = true;
									}

									// TO overwrite all above condition and disable everything
									if (isEditOrViewLoan) {
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
						name={
							fetchingGstAddress ? 'Fetching Address...' : 'Save and Proceed'
						}
						isLoader={loading}
						disabled={loading || fetchingGstAddress}
						onClick={handleSubmit(onProceed)}
					/>
				)}
				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}
				{!!selectedSection?.is_skip || !!isTestMode ? (
					<Button name='Skip' disabled={loading} onClick={onSkip} />
				) : null}

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
