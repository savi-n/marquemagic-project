import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DeleteCoApplicantModal from 'components/modals/DeleteCoApplicantModal';

import { setSelectedApplicantCoApplicantId } from 'store/applicantCoApplicantsSlice';
import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconAvatarInActive from 'assets/icons/Profile-complete.png';
import iconAvatarActive from 'assets/icons/Profile-in-progress.png';
import { useToasts } from 'components/Toast/ToastProvider';
import { setCountApplicants,setDirectors } from 'store/applicantCoApplicantsSlice';
import axios from 'axios';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_DOCUMENT_UPLOAD from 'components/Sections/DocumentUpload/const';
import { setSelectedSectionId } from 'store/appSlice';
import { getApplicantNavigationDetails } from 'utils/formatData';

const ApplicantCoApplicantHeader = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);

	const {
		selectedSectionId,
		selectedProduct,
		isLocalhost,
		isDraftLoan,
		firstSectionId,
		// clientToken,
		userToken,
	} = app;
	const [count, setCount] = useState({
		Director: 0,
		CoApplicants: 0,
	});
	// const [flag,setFlag]={};
	const { businessId } = application;
	const {
		coApplicants,
		selectedApplicantCoApplicantId,
		isApplicant,
		applicant,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants?.[selectedApplicantCoApplicantId] || {};
	const { cacheDocuments, allDocumentTypes } = application;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [directorListObject, setDirectorListObject] = useState();
	// console.log({ directorListObject });
	// const [directorList, setDirectorList] = useState({});
	const [
		isDeleteCoApplicantModalOpen,
		setIsDeleteCoApplicantModalOpen,
	] = useState(false);
	const refListWrapper = useRef(null);
	const isDocumentUploadMandatory = !!selectedProduct?.product_details
		?.document_mandatory;

	let isApplicantMandatoryDocumentSubmited = true;
	const OnFetchDirectorList = async () => {
		// console.log("Applicant CoApp header");
		try {
			const FetchDirectorList = await axios.get(
				`${API.API_END_POINT}/director_details?business_id=${businessId}`,
				{
					headers: {
						// Authorization: `Bearer eyJhbGciOiJFZERTQSJ9.eyJzdWJqZWN0IjoidXVpZCIsInVzZXIiOnsiaWQiOjEwOTQwLCJuYW1lIjoiT1BFTkRPT1JTIEZJTlRFQ0ggUFJJVkFURSBMSU1JVEVEIiwiZW1haWwiOiJ2YXJ1bmJoYWkubWl5YW5pQG5hbWFzdGVjcmVkaXQuY29tIiwiY29udGFjdCI6Ijk4OTQ3NDU4ODAiLCJjYWNvbXBuYW1lIjpudWxsLCJjYXBhbmNhcmQiOm51bGwsImFkZHJlc3MxIjoiIiwiYWRkcmVzczIiOiIiLCJwaW5jb2RlIjpudWxsLCJsb2NhbGl0eSI6bnVsbCwiY2l0eSI6bnVsbCwic3RhdGUiOm51bGwsInVzZXJ0eXBlIjoiQm9ycm93ZXIiLCJsZW5kZXJfaWQiOjEyMzc2LCJwYXJlbnRfaWQiOjAsInVzZXJfZ3JvdXBfaWQiOm51bGwsImFzc2lnbmVkX3NhbGVzX3VzZXIiOm51bGwsIm9yaWdpbmF0b3IiOm51bGwsImlzX2xlbmRlcl9hZG1pbiI6MCwic3RhdHVzIjoiYWN0aXZlIiwib3N2X25hbWUiOm51bGwsImZpcnN0bG9naW4iOiIwIiwiY3JlYXRlZG9uIjoiMDAwMC0wMC0wMCAwMDowMDowMCIsInVwZGF0ZV90aW1lIjoiMjAyMy0wMi0wNlQwNToyMDo0MS4wMDBaIiwiaXNfbGVuZGVyX21hbmFnZXIiOjAsIm9yaWdpbiI6InBvcnRhbCIsIndoaXRlX2xhYmVsX2lkIjoiOSIsImRlYWN0aXZhdGVfcmVhc3NpZ24iOiJObyIsIm5vdGlmaWNhdGlvbl9wdXJwb3NlIjpudWxsLCJ1c2VyX3N1Yl90eXBlIjoiIiwibm90aWZpY2F0aW9uX2ZsYWciOiJ5ZXMiLCJjcmVhdGVkYnlVc2VyIjoxMDk0MCwic291cmNlIjoiY2xpeC5sb2FuMnBhbC5jb20iLCJjaGFubmVsX3R5cGUiOm51bGwsIm90cCI6bnVsbCwid29ya190eXBlIjpudWxsLCJwcm9maWxlX2NvbXBsZXRpb24iOjMsInBpYyI6IiIsImxvZ2luX3N0YXR1cyI6Ijk5OTk5OSIsImJyYW5jaF9pZCI6bnVsbCwiaXNfY29ycG9yYXRlIjpudWxsLCJwcm9kdWN0c190eXBlIjpudWxsLCJpc19vdGhlciI6MCwiaXNfc3RhdGVfYWNjZXNzIjowLCJ1c2VyX3JlZmVyZW5jZV9ubyI6bnVsbCwibG9nZ2VkSW5XaGl0ZUxhYmVsSUQiOjl9LCJleHAiOjE2ODE4OTc5NTh9.XHAaIeVWixkSLcomsp5oFbjORaCceiM-sbycOQ-6d_TrA9TCK1PqgqRm2ppP7LxPa2ACv-SwOoI8si5GnpzaAw`,
						Authorization:`Bearer ${userToken}`,
						// Authorization:'Bearer eyJhbGciOiJFZERTQSJ9.eyJzdWJqZWN0IjoidXVpZCIsInVzZXIiOnsiaWQiOjEyODkwLCJuYW1lIjoiQmJtIiwiZW1haWwiOiJCQk1AdWkuY29tIiwiY29udGFjdCI6IjEyMzQ1Njc4OTAiLCJjYWNvbXBuYW1lIjoiIiwiY2FwYW5jYXJkIjpudWxsLCJhZGRyZXNzMSI6bnVsbCwiYWRkcmVzczIiOm51bGwsInBpbmNvZGUiOm51bGwsImxvY2FsaXR5IjpudWxsLCJjaXR5IjoiQmFuZ2Fsb3JlIiwic3RhdGUiOiJLQVJOQVRBS0EiLCJ1c2VydHlwZSI6IkJhbmsiLCJsZW5kZXJfaWQiOjEyMzc2LCJwYXJlbnRfaWQiOjAsInVzZXJfZ3JvdXBfaWQiOjAsImFzc2lnbmVkX3NhbGVzX3VzZXIiOm51bGwsIm9yaWdpbmF0b3IiOjEsImlzX2xlbmRlcl9hZG1pbiI6MSwic3RhdHVzIjoiYWN0aXZlIiwib3N2X25hbWUiOm51bGwsImZpcnN0bG9naW4iOiIxIiwiY3JlYXRlZG9uIjoiMjAyMi0wOC0yOVQwNjoxOToyMi4wMDBaIiwidXBkYXRlX3RpbWUiOiIyMDIzLTA0LTE5VDA5OjI3OjQ0LjAwMFoiLCJpc19sZW5kZXJfbWFuYWdlciI6MCwib3JpZ2luIjoiU3VwZXIgQWRtaW5pc3RyYXRvciBBZGQiLCJ3aGl0ZV9sYWJlbF9pZCI6IjksMyw3LDEsMzQsMTAiLCJkZWFjdGl2YXRlX3JlYXNzaWduIjoiTm8iLCJub3RpZmljYXRpb25fcHVycG9zZSI6NCwidXNlcl9zdWJfdHlwZSI6IlNhbGVzIiwibm90aWZpY2F0aW9uX2ZsYWciOiJ5ZXMiLCJjcmVhdGVkYnlVc2VyIjoxLCJzb3VyY2UiOiJDbGl4Y2FwaXRhbCIsImNoYW5uZWxfdHlwZSI6IjAiLCJvdHAiOm51bGwsIndvcmtfdHlwZSI6bnVsbCwicHJvZmlsZV9jb21wbGV0aW9uIjozLCJwaWMiOiIiLCJsb2dpbl9zdGF0dXMiOjE2ODE4OTc5Mjc0NTYyNzY4LCJicmFuY2hfaWQiOjE3OTYyMiwiaXNfY29ycG9yYXRlIjpudWxsLCJwcm9kdWN0c190eXBlIjpudWxsLCJpc19vdGhlciI6MCwiaXNfc3RhdGVfYWNjZXNzIjowLCJ1c2VyX3JlZmVyZW5jZV9ubyI6IjEyMzEyMyIsImxvZ2dlZEluV2hpdGVMYWJlbElEIjo5fSwiZXhwIjoxNjgxOTA4NzI4fQ.FqYCao8ZpP4urBMaJJiaBd1n_9hNw-w2VeOMM31UJJVJMJVuWqKN7frCH3aZ7BJgaK59lNBCRUTcoK2lLJTRBw'
					},
				}
			);
			// console.log(FetchDirectorList)
			setDirectorListObject(FetchDirectorList?.data);
		} catch (e) {
			addToast({
				message:
					'Unable to fetch the data from udyog. Please continue to fill the details.',
				// || error?.message ||
				// 'ROC search failed, try again',
				type: 'error',
			});
		}
	};
	const setGlobalCount=directorListObject=>{
		let director_count= 0;
				let coApplicant_count=0;
				let label='';
				let obj={};
		console.log(directorListObject)
		directorListObject?.data?.map(item => {
			// console.log(item);
			if (
				item.type_name === 'Director' ||
				item.type_name === 'Partner' ||
				item.type_name === 'Member' ||
				item.type_name === 'Proprietor'|| item.type_name==='Applicant'
			) {
				director_count=director_count+1;
				obj[item.id]={
					'type':item.type_name,
					'label':item.type_name+director_count
				}

			} else {
				coApplicant_count=coApplicant_count+1
				obj[item.id]={
					'type':item.type_name,
					'label':item.type_name+director_count
				}
			}
		});
		dispatch(setDirectors(obj))
		setCount({
			Director:director_count,
			CoApplicants:coApplicant_count,
		})
		}
useEffect(()=>{
OnFetchDirectorList();
},[])
	useEffect(()=>{
		setGlobalCount(directorListObject)
	},[directorListObject])
	dispatch(setCountApplicants(count));

	if (isDocumentUploadMandatory) {
		const applicantMandatoryDocumentIds = [];
		allDocumentTypes?.map(
			docType =>
				`${docType?.directorId}` === `${applicant.directorId}` &&
				docType?.isMandatory &&
				applicantMandatoryDocumentIds.push(
					`${applicant.directorId}${docType?.doc_type_id}`
				)
		);
		const applicantUploadedDocumetnIds = [];
		cacheDocuments?.map(d =>
			applicantUploadedDocumetnIds.push(`${d?.directorId}${d?.doc_type_id}`)
		);
		applicantMandatoryDocumentIds?.map(docId => {
			if (!applicantUploadedDocumetnIds.includes(docId)) {
				isApplicantMandatoryDocumentSubmited = false;
			}
			return null;
		});
		// console.log('applicant-doc-mandatory-', {
		// 	isApplicantMandatoryDocumentSubmited,
		// 	isDocumentUploadMandatory,
		// 	applicantMandatoryDocumentIds,
		// 	applicantUploadedDocumetnIds,
		// });
	}

	// console.log('ApplicantCoApplicantHeader-allstates-', {
	// 	props,
	// 	refListWrapper,
	// });

	const onClickApplicantCoApplicant = id => {
		// if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
		// 	return setIsDeleteCoApplicantModalOpen(id);
		// }
		if (selectedApplicantCoApplicantId === `${id}`) {
			return;
		}

		if (isDraftLoan) {
			const {
				nextApplicantDirectorId,
				isEmploymentDetailsSubmited,
				lastIncompleteDirectorId,
				lastIncompleteDirectorIndex,
			} = getApplicantNavigationDetails({
				applicant,
				coApplicants,
				selectedApplicant,
			});

			if (
				isEmploymentDetailsSubmited &&
				`${nextApplicantDirectorId}` === `${id}`
			) {
				// allowed to move
			} else {
				const tempSelectedApplicant =
					id === CONST_SECTIONS.APPLICANT ? applicant : coApplicants[id];
				if (
					!(
						Object.keys(
							tempSelectedApplicant?.[
								CONST_SECTIONS.EMPLOYMENT_DETAILS_SECTION_ID
							] || {}
						)?.length > 0
					)
				) {
					// if last director is applicant
					dispatch(setSelectedSectionId(firstSectionId));
					if (`${lastIncompleteDirectorId}` === `${applicant?.directorId}`) {
						dispatch(
							setSelectedApplicantCoApplicantId(CONST_SECTIONS.APPLICANT)
						);
					} else {
						dispatch(
							setSelectedApplicantCoApplicantId(lastIncompleteDirectorId)
						);
					}
					return addToast({
						message: `Please fill all the details of ${
							lastIncompleteDirectorIndex === 0
								? 'applicant'
								: `co-applicant ${lastIncompleteDirectorIndex}`
						}`,
						type: 'error',
					});
				}
			}
		}

		if (selectedSectionId !== CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID) {
			dispatch(setSelectedSectionId(firstSectionId));
		}
		dispatch(setSelectedApplicantCoApplicantId(id));
		// dispatch(setSelectedSectionId(firstSectionId));
	};

	let totalCoApplicantCount = 0;
	if (!!Object?.keys(coApplicants)?.length) {
		totalCoApplicantCount += Object?.keys(coApplicants)?.length;
	}
	if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
		totalCoApplicantCount += 1;
	}

	return (
		<UI.Wrapper>
			{isDeleteCoApplicantModalOpen && (
				<DeleteCoApplicantModal
					onNo={() => setIsDeleteCoApplicantModalOpen(false)}
					onYes={() => {
						setIsDeleteCoApplicantModalOpen(false);
						onClickApplicantCoApplicant(CONST_SECTIONS.APPLICANT);
					}}
					coApplicantNumber={Object.keys(coApplicants).length + 1}
				/>
			)}
			<UI.UL ref={refListWrapper} id='appRefList'>
				<UI.LI>
					<UI.Avatar
						src={isApplicant ? iconAvatarActive : iconAvatarInActive}
						alt='Avatar'
						onClick={() =>
							onClickApplicantCoApplicant(CONST_SECTIONS.APPLICANT)
						}
					/>
					{selectedSectionId ===
						CONST_DOCUMENT_UPLOAD.DOCUMENT_UPLOAD_SECTION_ID &&
						!isApplicantMandatoryDocumentSubmited && <UI.BadgeInvalid />}
					<UI.AvatarName>Applicant</UI.AvatarName>
				</UI.LI>
				{Object.keys(coApplicants).map((directorId, directorIndex) => {
					let isCoApplicantMandatoryDocumentSubmited = true;
					if (isDocumentUploadMandatory) {
						const coApplicantMandatoryDocumentIds = [];
						allDocumentTypes?.map(
							docType =>
								`${docType?.directorId}` === `${directorId}` &&
								docType?.isMandatory &&
								coApplicantMandatoryDocumentIds.push(
									`${directorId}${docType?.doc_type_id}`
								)
						);
						const coApplicantUploadedDocumetnIds = [];
						cacheDocuments?.map(d =>
							coApplicantUploadedDocumetnIds.push(
								`${d?.directorId}${d?.doc_type_id}`
							)
						);
						coApplicantMandatoryDocumentIds?.map(docId => {
							if (!coApplicantUploadedDocumetnIds.includes(docId)) {
								isCoApplicantMandatoryDocumentSubmited = false;
							}
							return null;
						});
					}
					return (
						<UI.LI key={`coapp-{${directorIndex}}-${directorId}`}>
							{/* DELETE Co-Applicant will be part of future release */}
							{/* {selectedApplicantCoApplicantId === directorId && (
								<UI.BadgeDelete src={iconDelete} />
							)} */}
							<UI.Avatar
								src={
									+selectedApplicantCoApplicantId === +directorId
										? iconAvatarActive
										: iconAvatarInActive
								}
								alt='Avatar'
								onClick={() => onClickApplicantCoApplicant(directorId)}
							/>
							{selectedSectionId ===
								CONST_DOCUMENT_UPLOAD.DOCUMENT_UPLOAD_SECTION_ID &&
								!isCoApplicantMandatoryDocumentSubmited && <UI.BadgeInvalid />}
							<UI.AvatarName>
								Co-Applicant
								{totalCoApplicantCount > 1 ? ` ${directorIndex + 1}` : ''}
							</UI.AvatarName>
						</UI.LI>
					);
				})}
				{selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT && (
					<UI.LI>
						<UI.BadgeDelete
							src={iconDelete}
							onClick={() => setIsDeleteCoApplicantModalOpen(true)}
							alt='delete'
						/>
						<UI.Avatar
							src={
								selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT
									? iconAvatarActive
									: iconAvatarInActive
							}
							alt='Avatar'
							onClick={() =>
								onClickApplicantCoApplicant(CONST_SECTIONS.CO_APPLICANT)
							}
						/>
						<UI.AvatarName>
							Co-Applicant
							{totalCoApplicantCount > 1
								? ` ${Object.keys(coApplicants).length + 1}`
								: ''}
						</UI.AvatarName>
					</UI.LI>
				)}
			</UI.UL>
			{isLocalhost && (
				<UI.UL>
					<UI.LI>
						selected <br />
						{selectedApplicantCoApplicantId}
						<br />
						applicant
						<br />
						{applicant?.directorId}
					</UI.LI>
				</UI.UL>
			)}
		</UI.Wrapper>
	);
};

export default ApplicantCoApplicantHeader;
