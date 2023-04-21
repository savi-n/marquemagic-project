import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import { toggleTestMode, setSelectedSectionId } from 'store/appSlice';
import { getApiErrorMessage } from 'utils/formatData';
import { useToasts } from 'components/Toast/ToastProvider';
import { updateApplicationSection } from 'store/applicationSlice';
import Button from 'components/Button';
import Modal from 'components/Modal';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui.js';
import Table from './Table.js';

const ConsentDetails = props => {
	// const fil = [
	// 	{
	// 		headers: ['Applicant', 'Aadhar Number', 'Status', ''],
	// 		data: [
	// 			{
	// 				name: 'John Doe',
	// 				aadhar_num: 'HJHJHJ4545GHGH',
	// 				status: 'In Progress',
	// 			},
	// 			{
	// 				name: 'John Doe',
	// 				aadhar_num: 'HJHJHJ4545GHGH',
	// 				status: 'In Progress',
	// 			},
	// 			{
	// 				name: 'John Doe',
	// 				aadhar_num: 'HJHJHJ4545GHGH',
	// 				status: 'In Progress',
	// 			},
	// 		],
	// 	},
	// ];

	const diff_sections = [
		{
			id: 'roc',
			name: 'ROC',
			fields: [
				{
					headers: ['Applicant', 'Aadhar Number', 'Status'],
					data: [
						{
							Applicant: 'John Doe',
							'Aadhar Number': 'One',
							Status: 'In Progress',
						},
						{
							'Aadhar Number': 'One',
							Applicant: 'John Doe',
							Status: 'In Progress',
						},
						{
							Applicant: 'John Doe',
							'Aadhar Number': 'One',
							Status: 'In Progress',
						},
					],
				},
				{
					headers: ['Company', 'Aadhar Number', 'Status'],
					data: [
						{
							Company: 'John Doe',
							'Aadhar Number': 'Four',
							Status: 'In Progrsadfess',
						},
						{
							'Aadhar Number': 'Four',
							Status: 'In Progrsadfess',
						},
						{
							'Aadhar Number': 'Four',
							Status: 'In Progrsadfess',
						},
					],
				},
				{
					headers: ['Company', 'Aadhar Number', 'Status'],
					data: [
						{
							Company: 'John Doe',
							'Aadhar Number': 'Four',
							Status: 'In Progrsadfess',
						},
						{
							'Aadhar Number': 'Four',
							Status: 'In Progrsadfess',
						},
						{
							'Aadhar Number': 'Four',
							Status: 'In Progrsadfess',
						},
					],
				},
			],
		},
		{
			id: 'cibil_equifax',
			name: 'CIBIL/Equifax',
			fields: [
				{
					headers: ['Applicant', 'Gst Number', 'Status'],
					data: [
						{
							Applicant: 'John Doe',
							'Gst Number': 'HJHJHJ4545GHGH',
							Status: 'In Progress',
						},
						{
							Applicant: 'John Doe',
							'Gst Number': 'HJHJHJ4545GHGH',
							Status: 'In Progress',
						},
						{
							Applicant: 'John Doe',
							'Gst Number': 'HJHJHJ4545GHGH',
							Status: 'In Progress',
						},
					],
				},
			],
		},
		{
			id: 'itr',
			name: 'ITR',
			fields: [
				{
					headers: ['Applicant', 'Itr Number', 'Status'],
					data: [
						{
							Applicant: 'John Doe',
							'Itr Number': 'HJHJHJ4545GHGH',
							Status: 'In Progress',
						},
						{
							Applicant: 'John Doe',
							'Itr Number': 'HJHJHJ4545GHGH',
							Status: 'In Progress',
						},
						{
							Applicant: 'John Doe',
							'Itr Number': 'HJHJHJ4545GHGH',
							Status: 'In Progress',
						},
					],
				},
			],
		},
	];

	const { app, application } = useSelector(state => state);
	const {
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		isTestMode,
		selectedSection,
		isLocalhost,
		isViewLoan,
	} = app;

	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(application?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const [htmlContent, setHtmlContent] = useState('');
	const [isGstModalOpen, setGstModalOpen] = useState(false);
	const fetchHandle = appObj => {
		axios
			.get(`http://localhost:1337/equifax?aadhar_num=${appObj.Applicant}`)
			.then(response => {
				setHtmlContent(response.data);
			})
			.catch(error => {
				console.error(error);
			});
		setGstModalOpen(true);
	};
	const onProceed = async () => {
		try {
			setLoading(true);
		} catch (error) {
			console.error('error-ConsentDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<UI_SECTIONS.Wrapper>
			<Modal
				show={isGstModalOpen}
				onClose={() => {
					setGstModalOpen(false);
				}}
				// Width='40%'
				customStyle={{
					width: '40%',
					minWidth: 'fit-content',
					minHeight: 'auto',
					position: 'relative',
					padding: '0',
				}}
			>
				<section>
					<UI.ImgClose
						onClick={() => {
							setGstModalOpen(false);
						}}
						style={{
							color: 'black',
							position: 'absolute',
							top: '0',
							right: '0',
							zIndex: '1',
							display: 'inline',
						}}
						src={imgClose}
						alt='close'
					/>
					<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
				</section>
			</Modal>
			{selectedSection?.sub_sections[0]?.name ? (
				<UI_SECTIONS.SubSectionHeader style={{ margin: '60px 0 20px 0' }}>
					{selectedSection?.sub_sections?.[0]?.name}
				</UI_SECTIONS.SubSectionHeader>
			) : null}

			{diff_sections?.map((sub_section, sectionIndex) => {
				return (
					<UI.TableWrapper key={`section-${sectionIndex}-${sub_section?.id}`}>
						<UI.TableMainHeader>{sub_section?.name}</UI.TableMainHeader>
						{sub_section.fields.map((field, idx) => {
							return (
								<>
									<Table
										headers={field.headers}
										data={field.data}
										fetchHandle={fetchHandle}
										hasSeperator={idx < sub_section.fields.length - 1}
									/>
								</>
							);
						})}
					</UI.TableWrapper>
				);
			})}
			<UI_SECTIONS.Footer>
				{!isViewLoan && (
					<Button
						fill
						name={'Save and Proceed'}
						isLoader={loading}
						disabled={loading}
						onClick={onProceed}
					/>
				)}
				{isViewLoan && (
					<>
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}

				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
					</>
				)}
				{isLocalhost && !isViewLoan && (
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
				)}
				<Button name='skip' onClick={onSkip} />
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default ConsentDetails;
