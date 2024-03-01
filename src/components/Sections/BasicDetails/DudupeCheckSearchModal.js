import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';

import Button from 'components/Button';
import Modal from 'components/Modal';
import useForm from 'hooks/useFormIndividual';

import { DDUPE_CHECK, LEADS_DATA } from '_config/app.config';
import { isFieldValid } from 'utils/formatData';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';
import { useToasts } from 'components/Toast/ToastProvider';
import Loading from 'components/Loading';

// import SAMPLE_JSON from './customerdetailsformsample.json';
import {
	setDedupePrefilledValues,
	setGeoLocation,
	setSelectedProductIdFromLead,
	setLeadId,
} from 'store/applicationSlice';
import { fetchGeoLocation } from 'utils/helper';
import * as API from '_config/app.config';
import CustomerListModal from 'components/ProductCard/CustomerListModal';
// import { useLayoutEffect } from 'react';

const DudupeCheckSearchModal = props => {
	const dispatch = useDispatch();
	const {
		show,
		onClose,
		setIsCustomerListdudupeModalOpen,
		customerListDudupe,
		product,
		setCustomerListDudupe,
		subProduct = {},
		isCustomerListdudupeModalOpen,
        formData,
        onFetchFromCustomerId,
        basicDetailsFormState,
	} = props;
	const { app, application } = useSelector(state => state);
	const { permission, whiteLabelId, userToken,selectedProduct } = app;
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const { register, formState, handleSubmit } = useForm();
	const [fetchingCustomerDetails, setFetchingCustomerDetails] = useState(false);
	// const [proceedAsNewCustomer, setProceedAsNewCustomer] = useState(false);
	const [leadsData, setLeadsData] = useState({});
	const [fetchingFormData, setFetchingFormData] = useState(false);
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


function handleskip(){
    onClose();
}
	useEffect(() => {
		// if (Object.keys(selectedDedupeData)?.length > 0)
		// 	setSelectedDedupeData(selectedDedupeData);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// useLayoutEffect(() => {
	// 	if (leadId && selectedProductIdsFromLead) {
	// 		fetchLeadsData();
	// 	}
	// }, []);

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
			let apiUrl = selectedProduct?.product_details?.individual_dedupe_api;
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
				isApplicant: false, //implemented based on savitha's changes - bad practice
				customer_id: formState?.values['customer_id'] || '',
				loan_product_details_id: selectedProduct?.id || undefined,
				parent_product_id: selectedProduct?.parent_id || undefined,
				// type_name:
				// 	`${productForModal?.loan_request_type ||
				// 		product?.loan_request_type}` === '2'
				// 		? 'Applicant'
				// 		: CONST.TYPE_NAME_MAPPING[(formState?.values['businesstype'])] ||
				// 		  '',
				origin: API.ORIGIN,
			};

			// setCustomerDetailsFormData(formState?.values || {});
            if (apiUrl) {
				const ddupeRes = await axios.post(apiUrl, reqBody, {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				});
				if (ddupeRes?.data.status === 'nok') {
					addToast({
						message:
							ddupeRes?.data?.message ||
							ddupeRes?.data?.Message ||
							'No Customer data found, please press SKIP and proceed to enter details.',
						type: 'error',
					});
					return;
				}
				ddupeRes && setCustomerListDudupe(ddupeRes?.data?.data || []);
				setIsCustomerListdudupeModalOpen(true);
				// onClose();
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

	const prefilledValues = field => {
		try {
			// // TEST MODE

			// if (isTestMode && CONST.initialFormState?.[field?.db_key]) {
			// 	return CONST.initialFormState?.[field?.db_key];
			// }
			// // -- TEST MODE
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field?.name];
			}
			const otherData = leadsData?.other_data || '';
			const tempSectionData = otherData ? JSON.parse(otherData) : {};
			// console.log({ otherData, tempSectionData });
			const preData = {
				businesstype: basicDetailsFormState?.business_type || basicDetailsFormState.income_type|| '',
				pan_number: basicDetailsFormState?.pan_number || '',
				mobile_no: basicDetailsFormState?.mobile_no || '',
				ddob: basicDetailsFormState?.ddob ||  basicDetailsFormState?.dob || '',
			};

			if (preData?.[field?.name]) return preData?.[field?.name];

			return field?.value || '';
		} catch (err) {
			console.error('error-BusinessDetials', {
				error: err,
				res: err?.response?.data || '',
			});
		}
	};

	return (
        <>
        {isCustomerListdudupeModalOpen && (
				<CustomerListModal
					show={isCustomerListdudupeModalOpen}
					customerList={customerListDudupe}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
					onClose={() => {
						setIsCustomerListdudupeModalOpen(false);
                        setSelectedCustomer(null);
					}}
                    
                    onProceedSelectCustomer={()=>onFetchFromCustomerId(selectedCustomer,formState)}
				/>
			)}
       
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
						{formData?.map(
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
												const newValue = prefilledValues(field);
												return (
													<UI_SECTIONS.FieldWrapGrid
														key={`field-${fieldIndex}-${field.name}`}
														style={{ padding: '10px 0' }}
													>
														{register({
															...field,
															value:
																formState?.values?.[field.name] ||
																newValue ||
																'',
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
						<Button
								disabled={fetchingCustomerDetails}
								isLoader={fetchingCustomerDetails}
								name='Proceed'
								onClick={handleProceed}
								fill
							/>
                            <Button
								disabled={fetchingCustomerDetails}
								isLoader={fetchingCustomerDetails}
								name='Skip'
								onClick={handleskip}
								fill
							/>
						</UI.CustomerDetailsFormModalFooter>
					</UI.ResponsiveWrapper>
				

		</Modal>
        </>
	);
};

export default DudupeCheckSearchModal;
