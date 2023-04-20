import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DeleteCoApplicantModal from 'components/modals/DeleteCoApplicantModal';

import { setSelectedApplicantCoApplicantId } from 'store/applicantCoApplicantsSlice';
import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconAvatarInActive from 'assets/icons/Profile-complete.png';
import iconAvatarActive from 'assets/icons/Profile-in-progress.png';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	setCountApplicants,
	setDirectors,
} from 'store/applicantCoApplicantsSlice';
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
						Authorization: `Bearer ${userToken}`,
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
	const setGlobalCount = directorListObject => {
		let director_count = 0;
		let coApplicant_count = 0;
		// let label = '';
		let obj = {};
		// console.log(directorListObject)
		directorListObject?.data?.map(item => {
			// console.log(item);
			if (
				item.type_name === 'Director' ||
				item.type_name === 'Partner' ||
				item.type_name === 'Member' ||
				item.type_name === 'Proprietor' ||
				item.type_name === 'Applicant'
			) {
				director_count = director_count + 1;
				obj[item.id] = {
					type: item.type_name,
					label: item.type_name + director_count,
				};
			} else {
				coApplicant_count = coApplicant_count + 1;
				obj[item.id] = {
					type: item.type_name,
					label: item.type_name + director_count,
				};
			}
			return null;
		});
		dispatch(setDirectors(obj));
		setCount({
			Director: director_count,
			CoApplicants: coApplicant_count,
		});
	};
	useEffect(() => {
		OnFetchDirectorList();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		setGlobalCount(directorListObject);
		dispatch(setCountApplicants(count));
		// eslint-disable-next-line
	}, [directorListObject]);

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
