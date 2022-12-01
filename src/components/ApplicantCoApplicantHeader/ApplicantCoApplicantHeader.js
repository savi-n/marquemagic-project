import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DeleteCoApplicantModal from 'components/modals/DeleteCoApplicantModal';

import { setSelectedApplicantCoApplicantId } from 'store/applicantCoApplicantsSlice';
import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconAvatarInActive from 'assets/icons/Profile-complete.png';
import iconAvatarActive from 'assets/icons/Profile-in-progress.png';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_DOCUMENT_UPLOAD from 'components/Sections/DocumentUpload/const';

const ApplicantCoApplicantHeader = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const { selectedSectionId, selectedProduct, isLocalhost } = app;
	const {
		coApplicants,
		selectedApplicantCoApplicantId,
		isApplicant,
		applicant,
	} = applicantCoApplicants;
	const { cacheDocuments, allDocumentTypes } = application;
	const dispatch = useDispatch();
	const [
		isDeleteCoApplicantModalOpen,
		setIsDeleteCoApplicantModalOpen,
	] = useState(false);
	const refListWrapper = useRef(null);

	let isApplicantMandatoryDocumentSubmited = true;
	if (selectedProduct?.product_details?.document_mandatory) {
		const applicantMandatoryDocumentIds = [];
		cacheDocuments?.map(doc => {
			if (
				`${doc?.directorId}` === `${applicant.directorId}` &&
				!!doc?.isMandatory
			) {
				applicantMandatoryDocumentIds.push(doc?.doc_type_id);
			}
			return null;
		});
		allDocumentTypes?.map(docType => {
			if (
				`${docType?.directorId}` === `${applicant.directorId}` &&
				!!docType?.isMandatory &&
				!applicantMandatoryDocumentIds.includes(docType?.doc_type_id)
			) {
				isApplicantMandatoryDocumentSubmited = false;
			}
			return null;
		});
	}

	// console.log('ApplicantCoApplicantHeader-allstates-', {
	// 	props,
	// 	refListWrapper,
	// });

	const onClickApplicantCoApplicant = id => {
		// if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
		// 	return setIsDeleteCoApplicantModalOpen(id);
		// }
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
					if (selectedProduct?.product_details?.document_mandatory) {
						const coApplicantMandatoryDocumentIds = [];
						cacheDocuments?.map(doc => {
							if (
								`${doc?.directorId}` === `${directorId}` &&
								!!doc?.isMandatory
							) {
								coApplicantMandatoryDocumentIds.push(doc?.doc_type_id);
							}
							return null;
						});
						allDocumentTypes?.map(docType => {
							if (
								`${docType?.directorId}` === `${directorId}` &&
								!!docType?.isMandatory &&
								!coApplicantMandatoryDocumentIds.includes(docType?.doc_type_id)
							) {
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
					<UI.LI>{selectedApplicantCoApplicantId}</UI.LI>
				</UI.UL>
			)}
		</UI.Wrapper>
	);
};

export default ApplicantCoApplicantHeader;
