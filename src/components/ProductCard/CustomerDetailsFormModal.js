import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Button from 'components/Button';
import Modal from 'components/Modal';
import useForm from 'hooks/useFormIndividual';

import { DDUPE_CHECK } from '_config/app.config';
import { isFieldValid } from 'utils/formatData';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import { useToasts } from '../Toast/ToastProvider';
import { useSelector } from 'react-redux';
// import SAMPLE_JSON from './customerdetailsformsample.json';

const CustomerDetailsFormModal = props => {
	const {
		show,
		onClose,
		setIsCustomerListModalOpen,
		product,
		redirectToProductPage,
		setCustomerList,
		setCustomerDetailsFormData,
		setSelectedDedupeData,
	} = props;
	const { app } = useSelector(state => state);
	const { permission, whiteLabelId } = app;
	const { register, formState, handleSubmit } = useForm();
	const [fetchingCustomerDetails, setFetchingCustomerDetails] = useState(false);
	const { addToast } = useToasts();
	const documentMapping = JSON.parse(permission?.document_mapping) || [];
	const dedupeApiData = documentMapping?.dedupe_api_details || {};
	const selectedDedupeData =
		dedupeApiData?.filter(item => {
			return item?.product_id?.includes(product?.id);
		})?.[0] || {};
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
			// console.log({ val: formState?.values });
			const reqBody =
				{
					...formState?.values,
					loan_product_id:
						product?.product_id?.[formState?.values?.['businesstype']] || '',
					white_label_id: whiteLabelId,
					id_no: formState?.values?.['pan_no'],
					customer_type: formState?.values['customer_type'],
					pan_number: formState?.values['pan_number'],
					mobile_num: formState?.values['mobile_no'],
					dob: formState?.values['ddob'],
					businesstype: formState?.values['businesstype'],
				} || {};
			setCustomerDetailsFormData(formState?.values || {});
			// const ddupeRes = await axios.post(DDUPE_CHECK, reqBody);
			const apiUrl = selectedDedupeData?.search_api || DDUPE_CHECK || '';

			if (apiUrl) {
				const ddupeRes = await axios.post(apiUrl, reqBody);
				// console.log('ddupeRes-', ddupeRes);
				if (ddupeRes?.data.message === 'No data found') {
					addToast({
						message:
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
				{product?.customer_details?.sub_sections?.map(
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
					{product?.customer_details?.is_skip && (
						<Button
							disabled={fetchingCustomerDetails}
							isLoader={fetchingCustomerDetails}
							onClick={redirectToProductPage}
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
