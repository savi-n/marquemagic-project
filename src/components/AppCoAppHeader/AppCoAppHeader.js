import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setSelectedSectionId } from 'store/appSlice';
import { setSelectedApplicantCoApplicantId } from 'store/applicantCoApplicantsSlice';
import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconAvatarInActive from 'assets/icons/Profile-complete.png';
import iconAvatarActive from 'assets/icons/Profile-in-progress.png';
import * as UI from './ui';
import * as CONST from './const';

const AppCoAppHeader = props => {
	const { firstSectionId } = useSelector(state => state.app);
	const { coApplicants, selectedApplicantCoApplicantId } = useSelector(
		state => state.applicantCoApplicants
	);
	const dispatch = useDispatch();
	const refListWrapper = useRef(null);

	// console.log('AppCoAppHeader-allstates-', {
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
			<UI.UL ref={refListWrapper} id='appRefList'>
				<UI.LI>
					<UI.Avatar
						src={
							selectedApplicantCoApplicantId === CONST.APPLICANT
								? iconAvatarActive
								: iconAvatarInActive
						}
						alt='Avatar'
						onClick={() => onClickApplicantCoApplicant(CONST.APPLICANT)}
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
				{selectedApplicantCoApplicantId === CONST.CO_APPLICANT && (
					<UI.LI>
						<UI.BadgeDelete
							src={iconDelete}
							onClick={() => onClickApplicantCoApplicant(CONST.APPLICANT)}
						/>
						<UI.Avatar
							src={
								selectedApplicantCoApplicantId === CONST.CO_APPLICANT
									? iconAvatarActive
									: iconAvatarInActive
							}
							alt='Avatar'
							onClick={() => onClickApplicantCoApplicant(CONST.CO_APPLICANT)}
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

export default AppCoAppHeader;
