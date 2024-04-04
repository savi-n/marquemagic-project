import React, { useState } from 'react';
import axios from 'axios';

import Button from 'components/Button';
import Modal from 'components/Modal';
import useForm from 'hooks/useFormIndividual';

import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './modalui';
import { useToasts } from '../../Toast/ToastProvider';
import { DDUPE_CHECK, ORIGIN } from '_config/app.config';
import { useSelector } from 'react-redux';
import CustomerListModal from 'components/ProductCard/CustomerListModal';
import { isFieldValid } from 'utils/formatData';

const UcicSearchModal = props => {
	const {
		show,
		onClose,
		basicDetailsFormState,
		isApplicant,
		setIsCustomerListModalOpen,
		setCustomerList,
		selectedDedupeData,
		isCustomerListModalOpen,
		customerList,
		formData,
		updateUCICNumber,
	} = props;
	const { app } = useSelector(state => state);

	const { selectedProduct, whiteLabelId, userToken } = app;
	const { register, formState } = useForm();
	const [fetchingCustomerDetails, setFetchingCustomerDetails] = useState(false);
	const { addToast } = useToasts();

	const prefilledValues = field => {
		try {
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field?.name];
			}

			const preData = {
				pan_number: '',
				mobile_no: '',
			};

			if (preData?.[field?.name]) return preData?.[field?.name];

			return field?.value || '';
		} catch (err) {
			console.error('error-UcicSearchModal', {
				error: err,
				res: err?.response?.data || '',
			});
		}
	};

	const handleProceed = async () => {
		try {
			setFetchingCustomerDetails(true);
			let apiUrl = '';
			apiUrl = selectedDedupeData?.search_api || DDUPE_CHECK;
			const reqBody = {
				// ...formState?.values,
				white_label_id: whiteLabelId,
				id_no: formState?.values?.['pan_no']?.toUpperCase() || '',
				pan_number: formState?.values['pan_no']?.toUpperCase() || '',
				mobile_num: formState?.values['mob_no'] || '',
				mobile_no: formState?.values['mob_no'] || '',
				loan_product_id:
					selectedProduct?.product_id?.[formState?.values?.['income_type']],
				loan_product_details_id: selectedProduct?.id || undefined,
				parent_product_id: selectedProduct?.parent_id || undefined,
				isApplicant: isApplicant,
				origin: ORIGIN,
			};

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
				ddupeRes && setCustomerList(ddupeRes?.data?.data || []);
				setIsCustomerListModalOpen(true);
				onClose();
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
		<>
			{isCustomerListModalOpen && (
				<CustomerListModal
					show={isCustomerListModalOpen}
					customerList={customerList}
					onClose={() => {
						setIsCustomerListModalOpen(false);
					}}
					filledFormData={basicDetailsFormState}
					onUpdateUCIC={updateUCICNumber}
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
				<>
					<UI.ImgClose onClick={onClose} src={imgClose} alt='close' />
					<UI.ResponsiveWrapper>
						{formData?.map((sub_section, sectionIndex) => {
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
												!isFieldValid({
													field,
													isApplicant: isApplicant,
													formState,
												})
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
															formState?.values?.[field.name] || newValue || '',
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
						})}

						<UI.CustomerDetailsFormModalFooter>
							<Button
								disabled={
									fetchingCustomerDetails ||
									(!formState?.values?.['search_customer_id']?.trim() &&
										!formState?.values?.['pan_no']?.trim() &&
										!formState?.values?.['mob_no']?.trim())
								}
								isLoader={fetchingCustomerDetails}
								name='Search UCIC Number'
								onClick={handleProceed}
								fill
							/>
						</UI.CustomerDetailsFormModalFooter>
					</UI.ResponsiveWrapper>
				</>
			</Modal>
		</>
	);
};

export default UcicSearchModal;
