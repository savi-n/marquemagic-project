import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DeleteCoApplicantModal from 'components/modals/DeleteCoApplicantModal';

import { setSelectedSectionId } from 'store/appSlice';
import { setSelectedApplicantCoApplicantId } from 'store/applicantCoApplicantsSlice';
import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconAvatarInActive from 'assets/icons/Profile-complete.png';
import iconAvatarActive from 'assets/icons/Profile-in-progress.png';
import * as UI from './ui';
// import * as CONST_SECTIONS from './const';
import * as CONST_SECTIONS from 'components/Sections/const';

const ApplicantCoApplicantHeader = props => {
	const { app, applicantCoApplicants } = useSelector(state => state);
	const { firstSectionId } = app;
	const {
		coApplicants,
		selectedApplicantCoApplicantId,
		isApplicant,
	} = applicantCoApplicants;
	const dispatch = useDispatch();
	const [
		isSeleteCoApplicantModalOpen,
		setIsSeleteCoApplicantModalOpen,
	] = useState(false);
	const refListWrapper = useRef(null);

	// console.log('ApplicantCoApplicantHeader-allstates-', {
	// 	props,
	// 	refListWrapper,
	// 	maxWidth,
	// 	scrollPos,
	// });

	useEffect(() => {}, [coApplicants]);

	const onClickApplicantCoApplicant = id => {
		dispatch(setSelectedApplicantCoApplicantId(id));
		dispatch(setSelectedSectionId(firstSectionId));
	};

	return (
		<UI.Wrapper>
			{isSeleteCoApplicantModalOpen && (
				<DeleteCoApplicantModal
					onNo={() => setIsSeleteCoApplicantModalOpen(false)}
					onYes={() => {
						setIsSeleteCoApplicantModalOpen(false);
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
					<UI.AvatarName>Applicant</UI.AvatarName>
				</UI.LI>
				{Object.keys(coApplicants).map((directorId, directorIndex) => {
					return (
						<UI.LI key={`coapp-{${directorIndex}}-${directorId}`}>
							{/* DELETE Co-Applicant will be part of future release */}
							{/* {selectedApplicantCoApplicantId === directorId && (
								<UI.BadgeDelete src={iconDelete} />
							)} */}
							<UI.Avatar
								src={
									selectedApplicantCoApplicantId === directorId
										? iconAvatarActive
										: iconAvatarInActive
								}
								alt='Avatar'
								onClick={() => onClickApplicantCoApplicant(directorId)}
							/>
							<UI.AvatarName>Co-Applicant {directorIndex + 1}</UI.AvatarName>
						</UI.LI>
					);
				})}
				{selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT && (
					<UI.LI>
						<UI.BadgeDelete
							src={iconDelete}
							onClick={() => setIsSeleteCoApplicantModalOpen(true)}
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
							Co-Applicant {Object.keys(coApplicants).length + 1}
						</UI.AvatarName>
					</UI.LI>
				)}
			</UI.UL>
		</UI.Wrapper>
	);
};

export default ApplicantCoApplicantHeader;
