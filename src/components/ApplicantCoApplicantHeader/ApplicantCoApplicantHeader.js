import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';

import DeleteCoApplicantModal from 'components/modals/DeleteCoApplicantModal';
import Loading from 'components/Loading';

import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconAvatarInActive from 'assets/icons/Profile-complete.png';
import iconAvatarActive from 'assets/icons/Profile-in-progress.png';
import {
	getDirectors,
	// setDirectors,
	setSelectedDirector,
} from 'store/directorsSlice';
import { setSelectedSectionId } from 'store/appSlice';
import { useToasts } from 'components/Toast/ToastProvider';
// import { getApplicantNavigationDetails } from 'utils/formatData';
// import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_DOCUMENT_UPLOAD from 'components/Sections/DocumentUpload/const';

const ApplicantCoApplicantHeader = props => {
	const { app, application } = useSelector(state => state);
	const {
		selectedDirectorId,
		directors,
		fetchingDirectors,
		addNewDirectorKey,
	} = useSelector(state => state.directors);

	const {
		selectedSectionId,
		selectedProduct,
		isLocalhost,
		// isDraftLoan,
		firstSectionId,
		// clientToken,
		// userToken,
	} = app;
	// const [flag,setFlag]={};
	const { businessId } = application;
	const { cacheDocuments, allDocumentTypes } = application;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [
		isDeleteCoApplicantModalOpen,
		setIsDeleteCoApplicantModalOpen,
	] = useState(false);
	// const [fetchingDirectors, setFetchingDirectors] = useState(false);
	const refListWrapper = useRef(null);

	const isDocumentUploadMandatory = !!selectedProduct?.product_details
		?.document_mandatory;

	const fetchDirectors = async () => {
		// console.log("Applicant CoApp header");
		if (!businessId) return;
		try {
			// setFetchingDirectors(true);
			// const directorsRes = await axios.get(
			// 	`${API.API_END_POINT}/director_details?business_id=${businessId}`,
			// 	{
			// 		headers: {
			// 			Authorization: `Bearer ${userToken}`,
			// 		},
			// 	}
			// );
			// console.log('directorsRes-', directorsRes);
			dispatch(getDirectors(businessId));
		} catch (e) {
			addToast({
				message:
					'Unable to fetch the data from udyog. Please continue to fill the details.',
				// || error?.message ||
				// 'ROC search failed, try again',
				type: 'error',
			});
		} finally {
			// setFetchingDirectors(false);
		}
	};

	useEffect(() => {
		fetchDirectors();
		// eslint-disable-next-line
	}, []);

	// console.log('ApplicantCoApplicantHeader-allstates-', {
	// 	props,
	// 	refListWrapper,
	// });

	const onClickApplicantCoApplicant = id => {
		// if (selectedDirectorId === CONST_SECTIONS.CO_APPLICANT) {
		// 	return setIsDeleteCoApplicantModalOpen(id);
		// }
		if (selectedDirectorId === `${id}`) {
			return;
		}

		// TODO: varun validation for navigation in draft mode
		// if (isDraftLoan) {
		// 	const {
		// 		nextApplicantDirectorId,
		// 		isEmploymentDetailsSubmited,
		// 		lastIncompleteDirectorId,
		// 		lastIncompleteDirectorIndex,
		// 	} = getApplicantNavigationDetails({
		// 		applicant: selectedDirector,
		// 		coApplicants: directors,
		// 		selectedApplicant: selectedDirector,
		// 	});

		// 	if (
		// 		isEmploymentDetailsSubmited &&
		// 		`${nextApplicantDirectorId}` === `${id}`
		// 	) {
		// 		// allowed to move
		// 	} else {
		// 		const tempSelectedApplicant =
		// 			id === CONST_SECTIONS.APPLICANT ? applicant : coApplicants[id];
		// 		if (
		// 			!(
		// 				Object.keys(
		// 					tempSelectedApplicant?.[
		// 						CONST_SECTIONS.EMPLOYMENT_DETAILS_SECTION_ID
		// 					] || {}
		// 				)?.length > 0
		// 			)
		// 		) {
		// 			// if last director is applicant
		// 			dispatch(setSelectedSectionId(firstSectionId));
		// 			if (`${lastIncompleteDirectorId}` === `${applicant?.directorId}`) {
		// 				dispatch(setSelectedDirector(applicant?.directorId));
		// 			} else {
		// 				dispatch(setSelectedDirector(lastIncompleteDirectorId));
		// 			}
		// 		}
		// 	}
		// 	return addToast({
		// 		message: `Please fill all the details of ${
		// 			lastIncompleteDirectorIndex === 0
		// 				? 'applicant'
		// 				: `co-applicant ${lastIncompleteDirectorIndex}`
		// 		}`,
		// 		type: 'error',
		// 	});
		// }

		if (selectedSectionId !== CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID) {
			dispatch(setSelectedSectionId(firstSectionId));
		}
		dispatch(setSelectedDirector(id));
		// dispatch(setSelectedSectionId(firstSectionId));
	};

	return (
		<UI.Wrapper>
			{fetchingDirectors ? (
				<UI.LoadingWrapper>
					<Loading />
				</UI.LoadingWrapper>
			) : (
				<>
					{isDeleteCoApplicantModalOpen && (
						<DeleteCoApplicantModal
							onNo={() => setIsDeleteCoApplicantModalOpen(false)}
							onYes={() => {
								setIsDeleteCoApplicantModalOpen(false);
								onClickApplicantCoApplicant(CONST_SECTIONS.APPLICANT);
							}}
							label={isDeleteCoApplicantModalOpen}
						/>
					)}
					<UI.UL ref={refListWrapper} id='appRefList'>
						{Object.keys(directors).length === 0 && (
							<UI.LI>
								<UI.Avatar src={iconAvatarActive} alt='Avatar' />
								{/* TODO: varun update mandatory flag doc upload */}
								{/* {selectedSectionId ===
									CONST_DOCUMENT_UPLOAD.DOCUMENT_UPLOAD_SECTION_ID &&
									!isApplicantMandatoryDocumentSubmited &&
									<UI.BadgeInvalid />} */}
								<UI.AvatarName>Applicant</UI.AvatarName>
							</UI.LI>
						)}
						{Object.keys(directors).map((directorId, directorIndex) => {
							let isMandatoryDocumentSubmited = true;
							const director = directors[directorId];
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
										isMandatoryDocumentSubmited = false;
									}
									return null;
								});
							}
							return (
								<>
									<UI.LI key={`coapp-{${directorIndex}}-${directorId}`}>
										{/* DELETE Co-Applicant will be part of future release */}
										{/* {selectedDirectorId === directorId && (
								<UI.BadgeDelete src={iconDelete} />
							)} */}
										<UI.Avatar
											src={
												+selectedDirectorId === +directorId
													? iconAvatarActive
													: iconAvatarInActive
											}
											alt='Avatar'
											onClick={() => onClickApplicantCoApplicant(directorId)}
										/>
										{selectedSectionId ===
											CONST_DOCUMENT_UPLOAD.DOCUMENT_UPLOAD_SECTION_ID &&
											!isMandatoryDocumentSubmited && <UI.BadgeInvalid />}
										<UI.AvatarName>{director?.label}</UI.AvatarName>
										{director?.shortName && (
											<UI.HoverBadge>
												{director?.shortName?.toLowerCase()}
											</UI.HoverBadge>
										)}
									</UI.LI>
								</>
							);
						})}
						{addNewDirectorKey && (
							<UI.LI>
								<UI.BadgeDelete
									src={iconDelete}
									onClick={() =>
										setIsDeleteCoApplicantModalOpen('[DYNAMIC LABEL]')
									}
									alt='delete'
								/>
								<UI.Avatar src={iconAvatarActive} alt='Avatar' />
								<UI.AvatarName>{addNewDirectorKey}</UI.AvatarName>
							</UI.LI>
						)}
					</UI.UL>
					{isLocalhost && (
						<UI.UL>
							<UI.LI>
								selected <br />
								{selectedDirectorId}
							</UI.LI>
						</UI.UL>
					)}
				</>
			)}
		</UI.Wrapper>
	);
};

export default ApplicantCoApplicantHeader;
