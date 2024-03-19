import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

import Button from 'components/Button';
import Modal from 'components/Modal';
import useForm from 'hooks/useFormIndividual';

import { isFieldValid } from 'utils/formatData';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import { useToasts } from 'components/Toast/ToastProvider';


import * as API from '_config/app.config';
import CustomerListModal from 'components/ProductCard/CustomerListModal';

const DudupeCheckSearchModal = props => {
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
		setIsApplicantDudupe,
	} = props;

	const { app } = useSelector(state => state);
	const {  whiteLabelId, userToken,selectedProduct,permission } = app;
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const { register, formState } = useForm();
	const [fetchingCustomerDetails, setFetchingCustomerDetails] = useState(false);
	const { addToast } = useToasts();
	const productForModal =
		Object.keys(subProduct).length > 0 ? subProduct : product;
		const documentMapping = JSON.parse(permission?.document_mapping) || [];
		const dedupeApiData = documentMapping?.dedupe_api_details || [];
		const selectedDedupeData =
			dedupeApiData && Array.isArray(dedupeApiData)
				? dedupeApiData?.filter(item => {
						return item?.product_id?.includes(selectedProduct?.id);
				  })?.[0] || {}
				: {};




function handleskip(){
    onClose();
}

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
				pan_number: formState?.values['pannumber']?.toUpperCase() || '',
				mobile_num: formState?.values['mobileno'] || '',
				dob: formState?.values['ddob'] || '',
				businesstype: formState?.values['businesstype'] || '',
				isApplicant: false, //implemented based on savitha's changes - bad practice
				customer_id: formState?.values['customer_id'] || '',
				loan_product_details_id: selectedProduct?.id || undefined,
				parent_product_id: selectedProduct?.parent_id || undefined,              
				origin: API.ORIGIN,
			};

            if (apiUrl || selectedDedupeData?.search_api) {
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
				setIsApplicantDudupe("false");
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

			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field?.name];
			}
			const preData = {
				businesstype: basicDetailsFormState?.business_type || basicDetailsFormState.income_type|| '',
				pannumber: basicDetailsFormState?.pan_number || '',
				mobileno: basicDetailsFormState?.mobile_no || '',
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
