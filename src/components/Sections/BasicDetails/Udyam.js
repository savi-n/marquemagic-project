// import React, { useState } from 'react';
// import axios from 'axios';

// const Udyam = () => {
// 	const [udyamDocumentTemp, setudyamDocumentTemp] = useState([]);

// 	const [udyamOrganisationDetails, setUdyamOrganisationDetails] = useState({
// 		nameOfEnterprise: '',
// 		dateOfIncorporation: '',
// 		dateOfUdyamRegistration: '',
// 		organisationType: '',
// 		officialAddress: '',
// 		Mobile: '',
// 	});
// 	const addUdyamDocumentTemp = file => {
// 		const newUdyamDocTemp = _.cloneDeep(udyamDocumentTemp);
// 		newUdyamDocTemp.push(file);
// 		setudyamDocumentTemp(newUdyamDocTemp);
// 	};

// 	const removeUdyamDocTemp = fieldName => {
// 		const newUdyamDocTemp = _.cloneDeep(udyamDocumentTemp);
// 		if (
// 			udyamDocumentTemp.filter(doc => doc?.field.nmae === fieldName).length > 0
// 		) {
// 			setudyamDocumentTemp(
// 				newUdyamDocTemp.filter(doc => doc?.field?.name !== fieldName)
// 			);
// 		}
// 		//Set the udyam document to null in section data
// 		//Refer basicdetails
// 	};

// 	const UdyamDocumentFileOnUpload =
// 		udyamDocumentTemp?.filter(
// 			doc => doc?.field?.name === 'udyam_upload'
// 		)?.[0] || null;

// 	const selectedUdyamDocumentFile = UdyamDocumentFileOnUpload;

// 	// const selectedUdyamDocument = UdyamDocumentFileOnUpload.name
// 	// 	? UdyamDocumentFileOnUpload
// 	// 	: selectedUdyamDocument;

// 	const udyamUploadedFile =
// 		udyamDocumentTemp?.filter(
// 			doc => doc?.field?.name === 'udyam_upload'
// 		)?.[0] || null;
// 	const onSaveAndProceed = async () => {
// 		try {
// 			const udyamDocField = selectedSection?.sub_sections?.[0]?.fields?.filter(
// 				field => field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME
// 			)?.[0];

// 			const isNewUdyamUploaded = !!udyamUploadedFile?.file;
// 			console.log(
// 				'isNewUdyamUploaded',
// 				isNewUdyamUploaded,
// 				'udyamUploadedFile',
// 				udyamUploadedFile
// 			);

// 			let udyamUrl = udyamUploadedFile?.preview || '';
// 			// const udyamDocFieldValue = isNewUdyamUploaded ? {
// 			// 	...udyamUploadedFile?.file,
// 			// 	doc_type_id: udyamDocField?.doc_type?.[selectedIncomeType],
// 			// 	is_delete_not_allowed: udyamDocField?.is_delete_not_allowed === true ? true : false
// 			// } :

// 			const udyamDocFieldValue = {
// 				...udyamUploadedFile?.file,
// 				doc_type_id: udyamDocField?.doc_type?.[selectedIncomeType],
// 				is_delete_not_allowed:
// 					udyamDocField?.is_delete_not_allowed === true ? true : false,
// 			};
// 			console.log('udyamDocFieldValue', udyamDocFieldValue);

// 			let udyam_doc_id = '';
// 			if (udyamDocumentTemp.length > 0) {
// 				try {
// 					const uploadUdyamDocTemp = [];
// 					const applicant =
// 						(!!directors &&
// 							Object.values(directors)?.filter(
// 								dir => dir?.type_name === CONST_SECTIONS.APPLICANT_TYPE_NAME
// 							)?.[0]) ||
// 						{};
// 					udyamDocumentTemp?.map(doc => {
// 						uploadUdyamDocTemp.push({
// 							...doc,
// 							loan_id: loanId,
// 							preview: null,
// 							is_delete_not_allowed:
// 								doc?.field?.is_delete_not_allowed === true ? true : false,
// 							directorId:
// 								`${selectedProduct?.loan_request_type}` === '1'
// 									? 0
// 									: +applicant?.directorId,
// 						});
// 						return null;
// 					});

// 					if (uploadUdyamDocTemp.length) {
// 						const udyamUploadReqBody = {
// 							...basicDetailsReqBody,
// 							data: {
// 								documentUplaod: uploadUdyamDocTemp,
// 							},
// 						};
// 						console.log('udyamDocUploadReqBody -', udyamUploadReqBody);
// 						const borrowerDocUploadRes = await axios.post(
// 							`${API.BORROWER_UPLOAD_URL}`,
// 							udyamUploadReqBody
// 						);
// 						console.log('borrowerDocUploadRes -', borrowerDocUploadRes);

// 						const updateDocumentIdToUdyamDocuments = [];
// 						uploadCacheDocumentsTemp.map(udyamDoc => {
// 							const resDoc =
// 								borrowerDocUploadRes?.data?.data?.filter(
// 									resDoc => resDoc?.doc_name === udyamDoc?.document_key
// 								)?.[0] || {};
// 							const newDoc = {
// 								...resDoc,
// 								...cacheDoc,
// 								isDocRemoveAllowed: false,
// 								document_id: resDoc?.id,
// 							};
// 							udyam_doc_id = resDoc?.id;
// 							updateDocumentIdToUdyamDocuments.push(newDoc);
// 							return null;
// 						});
// 						// console.log('updateDocumentIdToUdyamDocuments-', {
// 						// 	updateDocumentIdToUdyamDocuments,
// 						// });
// 					}
// 				} catch (error) {
// 					console.error('error - ', error);
// 				}
// 			}
// 			if (udyam_doc_id) {
// 				basicDetailsReqBody.data.udyan_details.doc_id = udyam_doc_id;
// 			}
// 		} catch (error) {
// 			console.error('error - ', error);
// 		}
// 	};

// 	const handleUdyamDoc = () => {
// 		if (field.type === 'file' && field.name === 'udyam_upload') {
// 			const selectedDocTypeId = field?.doc_type?.[selectedIncomeType];
// 			const errorMessage =
// 				(formState?.submit?.isSubmited || formState?.touched?.[field.name]) &&
// 				formState?.error?.[field.name];
// 			return (
// 				<UI_SECTIONS.FieldWrapGrid key={`field-${fieldIndex}-${field.name}`}>
// 					<InputFieldSingleFileUpload
// 						field={field}
// 						uploadedFile={selectedUdyamDocumentFile}
// 						selectedDocTypeId={selectedDocTypeId}
// 						clearErrorFormState={clearErrorFormState}
// 						addCacheDocumentTemp={addUdyamDocumentTemp}
// 						removeCacheDocumentTemp={removeUdyamDocTemp}
// 						errorColorCode={errorMessage ? 'red' : ''}
// 						isFormSubmited={!!formState?.submit?.isSubmited}
// 						category='other' // TODO: varun discuss with madhuri how to configure this category from JSON
// 					/>
// 					{errorMessage && (
// 						<UI_SECTIONS.ErrorMessage>{errorMessage}</UI_SECTIONS.ErrorMessage>
// 					)}
// 				</UI_SECTIONS.FieldWrapGrid>
// 			);
// 		}
// 	};

// 	return <div>Udyam</div>;
// };

// export default Udyam;

// // udyam_number:
// // 	sectionData?.director_details?.udyam_number ||
// // 	sectionData?.business_details?.udyam_number,
