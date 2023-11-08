import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';

import Button from 'components/Button';
import Modal from 'components/Modal';
import useForm from 'hooks/useFormIndividual';

import { DDUPE_CHECK } from '_config/app.config';
import { isFieldValid } from 'utils/formatData';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';
import { useToasts } from '../Toast/ToastProvider';
// import SAMPLE_JSON from './customerdetailsformsample.json';
import {
	setDedupePrefilledValues,
	setGeoLocation,
} from 'store/applicationSlice';
import { fetchGeoLocation } from 'utils/helper';
import * as API from '_config/app.config';

const CustomerDetailsFormModal = props => {
	const dispatch = useDispatch();
	const {
		show,
		onClose,
		setIsCustomerListModalOpen,
		product,
		redirectToProductPage,
		setCustomerList,
		setCustomerDetailsFormData,
		setSelectedDedupeData,
		subProduct = {},
		setProductModalData,
		redirectToProductPageInEditMode,
	} = props;
	const { app } = useSelector(state => state);
	const { permission, whiteLabelId, userToken } = app;
	const { register, formState, handleSubmit } = useForm();
	const [fetchingCustomerDetails, setFetchingCustomerDetails] = useState(false);
	// const [proceedAsNewCustomer, setProceedAsNewCustomer] = useState(false);

	const { addToast } = useToasts();

	const productForModal =
		Object.keys(subProduct).length > 0 ? subProduct : product;

	// console.log({
	// 	subProduct,
	// 	product,
	// 	productForModal,
	// });

	const documentMapping = JSON.parse(permission?.document_mapping) || [];
	const dedupeApiData = documentMapping?.dedupe_api_details || [];
	const selectedDedupeData =
		dedupeApiData && Array.isArray(dedupeApiData)
			? dedupeApiData?.filter(item => {
					return item?.product_id?.includes(productForModal?.id);
			  })?.[0] || {}
			: {};
	// console.log(
	// 	{ dedupeApiData, product, selectedDedupeData },
	// 	'customerDetailsFormModal.js'
	// );

	useEffect(() => {
		if (Object.keys(selectedDedupeData)?.length > 0)
			setSelectedDedupeData(selectedDedupeData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// api_details : {
	// 	is_otp_required: false,
	// 	search_api: 'http://20.204.69.253:3200/Ucic/search',
	// 	dedupe_fetch: 'http://20.204.69.253:3200/Ucic/fetchData',
	// 	get_customer_otp: '/get_customer_otp',
	// 	verify_customer_otp: '/verify_customer',
	// };
	const handleProceed = async () => {
		// step 1 - Api call for search api for dedupe
		try {
			setFetchingCustomerDetails(true);
			dispatch(setDedupePrefilledValues(formState?.values));
			const geoRes = await fetchGeoLocation({
				geoAPI: API.GEO_LOCATION,
				userToken,
			});
			dispatch(setGeoLocation(geoRes));
			// setProceedAsNewCustomer(false);

			// console.log(
			// 	'🚀 ~ file: CustomerDetailsFormModal.js:81 ~ handleProceed ~ productForModal:',
			// 	productForModal
			// );
			setProductModalData(productForModal);
			// console.log({ val: formState?.values });
			let apiUrl = '';

			if (
				formState?.values?.[CONST.SEARCH_CUSTOMER_USING_FIELD_DB_KEY] ===
				CONST.SEARCH_CUSTOMER_USING_FIELD_VALUES.ucic_number
			) {
				apiUrl = selectedDedupeData?.verify;
			} else {
				apiUrl = selectedDedupeData?.search_api || DDUPE_CHECK;
			}
			// const apiUrl =
			// 	formState?.values?.[CONST.SEARCH_CUSTOMER_USING_FIELD_DB_KEY] ===
			// 	CONST.SEARCH_CUSTOMER_USING_FIELD_VALUES.id_number
			// 		? selectedDedupeData?.search_api
			// 		: selectedDedupeData?.verify;

			const reqBody = {
				...formState?.values,
				loan_product_id:
					productForModal?.product_id?.[formState?.values?.['businesstype']] ||
					'',
				white_label_id: whiteLabelId,
				id_no: formState?.values?.['pan_no'] || '',
				customer_type: formState?.values['customer_type'] || '',
				pan_number: formState?.values['pan_number']?.toUpperCase() || '',
				mobile_num: formState?.values['mobile_no'] || '',
				dob: formState?.values['ddob'] || '',
				businesstype: formState?.values['businesstype'] || '',
				isApplicant: true, //implemented based on savitha's changes - bad practice
				customer_id: formState?.values['customer_id'] || '',
				loan_product_details_id: productForModal?.id || undefined,
				parent_product_id: productForModal?.parent_id || undefined,
				type_name:
					`${productForModal?.loan_request_type ||
						product?.loan_request_type}` === '2'
						? 'Applicant'
						: CONST.TYPE_NAME_MAPPING[(formState?.values['businesstype'])] ||
						  '',
				origin: API.ORIGIN,
				lat: geoRes?.lat || '',
				long: geoRes?.long || '',
				timestamp: geoRes?.timestamp || '',
			};

			setCustomerDetailsFormData(formState?.values || {});
			// const ddupeRes = await axios.post(DDUPE_CHECK, reqBody);
			// const apiUrl = selectedDedupeData?.search_api || DDUPE_CHECK || '';

			if (apiUrl) {
				const ddupeRes = await axios.post(apiUrl, reqBody, {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				});
				// console.log('ddupeRes-', ddupeRes);

				if (
					formState?.values?.[CONST.SEARCH_CUSTOMER_USING_FIELD_DB_KEY] ===
					CONST.SEARCH_CUSTOMER_USING_FIELD_VALUES.ucic_number
				) {
					// console.log({ ddupeRes }, ' fetch-called ---- if part');
					if (ddupeRes?.data?.status === 'nok') {
						addToast({
							message:
								ddupeRes?.data?.message ||
								'No Customer Data Found Against The Provided Customer ID',
							type: 'error',
						});
						return;
					}
					redirectToProductPageInEditMode(ddupeRes?.data, productForModal);
				} else {
					// console.log({ ddupeRes }, 'search-called ---- else part');
					if (ddupeRes?.data.status === 'nok') {
						addToast({
							message:
								ddupeRes?.data?.message ||
								ddupeRes?.data?.Message ||
								'No Customer data found, please press SKIP and proceed to enter details.',
							type: 'error',
						});
						// setProceedAsNewCustomer(true);
						return;
					}
					ddupeRes && setCustomerList(ddupeRes?.data?.data || []);

					setIsCustomerListModalOpen(true);
					onClose();
				}
			}
		} catch (e) {
			console.error(e.message);
			addToast({
				message:
					e?.response?.data?.message ||
					e?.response?.data?.Message ||
					e.message ||
					'Error in fetching the customer details. Please verify the entered details.',
				type: 'error',
			});
		} finally {
			setFetchingCustomerDetails(false);
		}
	};

	return (
		<Modal
			show={show}
			onClose={onClose}
			width='50%'
			height='70%'
			customStyle={{
				padding: '40px',
			}}
		>
			<UI.ImgClose onClick={onClose} src={imgClose} alt='close' />
			<UI.ResponsiveWrapper>
				{/* {SAMPLE_JSON?.sub_sections?.map((sub_section, sectionIndex) => { */}
				{productForModal?.customer_details?.sub_sections?.map(
					(sub_section, sectionIndex) => {
						return (
							<React.Fragment
								key={`section-${sectionIndex}-${sub_section?.id}`}
							>
								{sub_section?.name ? (
									<UI.CustomerDetailsFormModalHeader>
										{sub_section.name}
									</UI.CustomerDetailsFormModalHeader>
								) : null}
								<UI_SECTIONS.FormWrap>
									{sub_section?.fields?.map((field, fieldIndex) => {
										if (
											!isFieldValid({ field, isApplicant: true, formState })
										) {
											return null;
										}
										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${fieldIndex}-${field.name}`}
												style={{ padding: '10px 0' }}
											>
												{register({
													...field,
													value: formState?.values?.[field.name] || '',
													visibility: 'visible',
												})}

												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field.name]) &&
													formState?.error?.[field.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field.name]}
														</UI_SECTIONS.ErrorMessage>
													)}
											</UI_SECTIONS.FieldWrapGrid>
										);
									})}
								</UI_SECTIONS.FormWrap>
							</React.Fragment>
						);
					}
				)}

				<UI.CustomerDetailsFormModalFooter>
					{productForModal?.customer_details?.is_skip && (
						<Button
							disabled={fetchingCustomerDetails}
							isLoader={fetchingCustomerDetails}
							onClick={async () => {
								const geoRes = await fetchGeoLocation({
									geoAPI: API.GEO_LOCATION,
									userToken,
								});
								dispatch(setGeoLocation(geoRes));
								redirectToProductPage(productForModal);
								dispatch(setDedupePrefilledValues(formState?.values));
							}}
							// name={proceedAsNewCustomer ? 'Proceed As New Customer' : 'Skip'}
							name='Skip'
						/>
					)}
					<Button
						disabled={fetchingCustomerDetails}
						isLoader={fetchingCustomerDetails}
						name='Proceed'
						onClick={handleSubmit(handleProceed)}
						fill
					/>
				</UI.CustomerDetailsFormModalFooter>
			</UI.ResponsiveWrapper>
		</Modal>
	);
};

export default CustomerDetailsFormModal;
