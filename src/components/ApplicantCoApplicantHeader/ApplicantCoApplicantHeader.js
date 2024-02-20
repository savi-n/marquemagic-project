import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import DeleteCoApplicantModal from 'components/modals/DeleteCoApplicantModal';
import Loading from 'components/Loading';

import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconAvatarInActive from 'assets/icons/Profile-complete.png';
import iconAvatarActive from 'assets/icons/Profile-in-progress.png';
import {
	DIRECTOR_TYPES,
	getDirectors,
	setAddNewDirectorKey,
	setSelectedDirectorId,
} from 'store/directorsSlice';
import { setSelectedSectionId } from 'store/appSlice';
import {
	getSelectedDirectorIndex,
	// isDirectorApplicant,
} from 'utils/formatData';
import { useToasts } from 'components/Toast/ToastProvider';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_DOCUMENT_UPLOAD from 'components/Sections/DocumentUpload/const';
import * as CONST from './const';
import { DELETE_CO_APPLICANT } from '_config/app.config';

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
		isViewLoan,
		// isEditLoan,
		userDetails,
	} = app;
	// const [flag,setFlag]={};
	const {
		cacheDocuments,
		allDocumentTypes,
		loanRefId,
		// businessType,
		businessName,
		businessId,
	} = application;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [isDeleteDirectorModalOpen, setIsDeleteDirectorModalOpen] = useState(
		false
	);
	// const [fetchingDirectors, setFetchingDirectors] = useState(false);
	const refListWrapper = useRef(null);

	const isDocumentUploadMandatory = !!selectedProduct?.product_details
		?.document_mandatory;

	const fetchDirectors = async () => {
		if (!loanRefId) {
			if (selectedProduct?.isSelectedProductTypeSalaried) {
				dispatch(setAddNewDirectorKey(DIRECTOR_TYPES.applicant));
			} else {
				dispatch(setAddNewDirectorKey(DIRECTOR_TYPES.director));
			}
			return;
		}
		try {
			dispatch(
				getDirectors({
					loanRefId,
					isSelectedProductTypeBusiness:
						selectedProduct?.isSelectedProductTypeBusiness,
					selectedSectionId,
				})
			);
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

	useEffect(() => {
		fetchDirectors();
		// eslint-disable-next-line
	}, []);

	const onClickDirectorAvatar = id => {
		if (selectedSectionId !== CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID) {
			dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
		}

		dispatch(setSelectedDirectorId(id));
		// dispatch(setSelectedSectionId(firstSectionId));
	};

	const deleteDirectorData = async id => {
		try {
			// setFetchingFormData(true);
			// get method of the sections is here. modify the api of this particular section
			const deleteReqBody = { business_id: businessId, director_id: id };
			const fetchRes = await axios.post(DELETE_CO_APPLICANT, deleteReqBody, {
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem('userToken')}`,
				},
			});
			// console.log('=>', fetchRes);
			if (fetchRes?.data?.status === 'ok') {
				fetchDirectors();
				onClickDirectorAvatar('');
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		} finally {
			// setFetchingFormData(false);
		}
	};

	const isEntityMandatoryUploaded = () => {
		let isEntityMandatoryDocsSubmitted = true;
		if (isDocumentUploadMandatory) {
			const entityMandatoryDocIds = [];
			allDocumentTypes?.map(
				docType =>
					`${docType?.directorId}` === `${CONST.ENTITY_DIRECTOR_ID}` &&
					docType?.isMandatory &&
					entityMandatoryDocIds.push(
						`${CONST.ENTITY_DIRECTOR_ID}${docType?.doc_type_id}`
					)
			);
			// console.log(allDocumentTypes, 'alldocument types');
			const entityUploadedDocumentsIds = [];
			cacheDocuments?.map(doc =>
				entityUploadedDocumentsIds.push(
					`${CONST.ENTITY_DIRECTOR_ID}${doc?.doc_type_id}`
				)
			);
			// console.log(
			// 	'🚀 ~ file: ApplicantCoApplicantHeader.js:107 ~ isEntityMandatoryUploaded ~ entityUploadedDocumentsIds:',
			// 	entityUploadedDocumentsIds,
			// 	entityMandatoryDocIds
			// );

			entityMandatoryDocIds?.map(docId => {
				if (!entityUploadedDocumentsIds.includes(docId)) {
					isEntityMandatoryDocsSubmitted = false;
				}
				return null;
			});
		}
		return isEntityMandatoryDocsSubmitted;
	};

	const totalNumberOfCoApps = Object.keys(directors)?.filter(
		directorId => directors[directorId]?.type_name === `Co-applicant`
	).length;

	const showDeleteIconIfCoApp = director => {
		let showDeleteIconForCoApp = false;
		if (director?.type_name === 'Co-applicant') {
			if (totalNumberOfCoApps > 1) {
				showDeleteIconForCoApp = true;
				return showDeleteIconForCoApp;
			} else {
				return false;
			}
		}
		return true;
	};

	const showCoApplicantDeleteBtn = () => {
		return (
			selectedProduct?.product_details?.allow_users_to_delete_co_applicants?.includes(
				userDetails?.usertype
			) ||
			selectedProduct?.product_details?.allow_users_to_delete_co_applicants?.includes(
				userDetails?.user_sub_type
			)
		);
	};

	return (
		<UI.Wrapper>
			{fetchingDirectors ? (
				<UI.LoadingWrapper>
					<Loading />
				</UI.LoadingWrapper>
			) : (
				<>
					{isDeleteDirectorModalOpen && (
						<DeleteCoApplicantModal
							onNo={() => setIsDeleteDirectorModalOpen(false)}
							onYes={() => {
								deleteDirectorData(isDeleteDirectorModalOpen?.id);
								setIsDeleteDirectorModalOpen(false);
								dispatch(setAddNewDirectorKey(''));
								dispatch(setSelectedDirectorId(+Object.keys(directors)?.pop()));
							}}
							label={
								isDeleteDirectorModalOpen?.type_name
									? `${isDeleteDirectorModalOpen?.type_name} ${
											isDeleteDirectorModalOpen?.dfirstname
									  } ${isDeleteDirectorModalOpen?.dlastname}`
									: `${isDeleteDirectorModalOpen}`
							}
						/>
					)}
					<UI.UL ref={refListWrapper} id='appRefList'>
						{selectedProduct?.isSelectedProductTypeBusiness &&
							selectedSectionId ===
								CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID && (
								<UI.LI>
									<UI.Avatar
										src={
											!selectedDirectorId
												? iconAvatarActive
												: iconAvatarInActive
										}
										alt='Avatar'
										onClick={() => onClickDirectorAvatar('')}
									/>
									{selectedSectionId ===
										CONST_DOCUMENT_UPLOAD.DOCUMENT_UPLOAD_SECTION_ID &&
										!isEntityMandatoryUploaded() && <UI.BadgeInvalid />}
									<UI.AvatarName>Entity</UI.AvatarName>
									<UI.HoverBadge title={businessName}>
										{businessName}
									</UI.HoverBadge>
								</UI.LI>
							)}
						{Object.keys(directors).map((directorId, directorIndex) => {
							let isMandatoryDocumentSubmited = true;
							const director = directors[directorId];
							let isSelectNotAllowed = false;
							if (addNewDirectorKey) {
								isSelectNotAllowed = true;
							}
							// if (directors[selectedDirectorId]['sections'].length !== 3) {
							// 	isSelectNotAllowed = true;
							// }
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
										{showCoApplicantDeleteBtn() &&
										selectedSectionId !== CONST.DOCUMENT_UPLOAD_SECTION_ID &&
										showDeleteIconIfCoApp(director) &&
										directorIndex > 0 &&
										!isViewLoan ? (
											<UI.BadgeDelete
												src={iconDelete}
												onClick={() => setIsDeleteDirectorModalOpen(director)}
												alt='delete'
											/>
										) : null}

										<UI.Avatar
											src={
												+selectedDirectorId === +directorId
													? iconAvatarActive
													: iconAvatarInActive
											}
											alt='Avatar'
											onClick={() => {
												if (isSelectNotAllowed) {
													return;
												}
												onClickDirectorAvatar(directorId);
											}}
											style={
												isSelectNotAllowed ? { cursor: 'not-allowed	' } : {}
											}
										/>
										{selectedSectionId ===
											CONST_DOCUMENT_UPLOAD.DOCUMENT_UPLOAD_SECTION_ID &&
											!isMandatoryDocumentSubmited && <UI.BadgeInvalid />}
										<UI.AvatarName>
											{`${director?.label} ${getSelectedDirectorIndex({
												directors,
												selectedDirector: director,
											})}`}
										</UI.AvatarName>
										{director?.fullName && (
											<UI.HoverBadge title={director?.fullName}>
												{director?.fullName?.toLowerCase()}
											</UI.HoverBadge>
										)}
									</UI.LI>
								</>
							);
						})}
						{addNewDirectorKey && (
							<UI.LI>
								{addNewDirectorKey !== DIRECTOR_TYPES.applicant &&
									Object.keys(directors).length !== 0 && (
										<UI.BadgeDelete
											src={iconDelete}
											onClick={() =>
												setIsDeleteDirectorModalOpen(addNewDirectorKey)
											}
											alt='delete'
										/>
									)}
								<UI.Avatar src={iconAvatarActive} alt='Avatar' />
								{/* <UI.AvatarName>
									{`${selectedProduct?.loan_request_type}` === '1' &&
									Object.keys(directors)?.length <= 0
										? CONST_SECTIONS.BUSINESS_TYPE_OPTIONS[businessType]
										: addNewDirectorKey}
								</UI.AvatarName> */}
								<UI.AvatarName>{addNewDirectorKey}</UI.AvatarName>
								<UI.HoverBadge>&nbsp;</UI.HoverBadge>
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
