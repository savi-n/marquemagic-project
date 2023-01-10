import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DeleteCoApplicantModal from 'components/modals/DeleteCoApplicantModal';

import { setSelectedApplicantCoApplicantId } from 'store/applicantCoApplicantsSlice';
import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconAvatarInActive from 'assets/icons/Profile-complete.png';
import iconAvatarActive from 'assets/icons/Profile-in-progress.png';
import { useToasts } from 'components/Toast/ToastProvider';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_DOCUMENT_UPLOAD from 'components/Sections/DocumentUpload/const';
import { setSelectedSectionId } from 'store/appSlice';

const ApplicantCoApplicantHeader = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const { selectedSectionId, selectedProduct, isLocalhost, isDraftLoan } = app;
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
	const [
		isDeleteCoApplicantModalOpen,
		setIsDeleteCoApplicantModalOpen,
	] = useState(false);
	const refListWrapper = useRef(null);
	const isDocumentUploadMandatory = !!selectedProduct?.product_details
		?.document_mandatory;

	let isApplicantMandatoryDocumentSubmited = true;
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
		if (isDraftLoan) {
			if (
				!(
					Object.keys(
						selectedApplicant?.[CONST_SECTIONS.EMPLOYMENT_DETAILS_SECTION_ID] ||
							{}
					)?.length > 0
				)
			) {
				return addToast({
					message: 'Please fill all the details of selected applicant',
					type: 'error',
				});
			}
		}

		if (selectedSectionId !== CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID) {
			dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
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
