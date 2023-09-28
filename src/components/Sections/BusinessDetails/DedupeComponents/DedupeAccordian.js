import React, { useState } from 'react';
import * as UI_SECTIONS from 'components/Sections/ui';
import Modal from 'components/Modal';
import expandIcon from 'assets/icons/right_arrow_active.png';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import Button from 'components/Button';
import DedupeMatchTable from './DedupeMatchTable';
import * as UI from './ui';

const DedupeAccordian = props => {
	const { data = [], fetchDedupeCheckData, dedupedata } = props;
	console.log(
		'🚀 ~ file: DedupeAccordian.js:12 ~ DedupeAccordian ~ data:',
		data,
		dedupedata
	);
	const [
		isApplicationMatchModalOpen,
		setIsApplicationMatchModalOpen,
	] = useState(false);
	const [currentLevelData, setCurrentLevelData] = useState([]);

	const [accordianStates, setAccordianStates] = useState(
		data.reduce((acc, item) => {
			acc[item.id] = false;
			return acc;
		}, {})
	);

	const toggleAccordian = id => {
		// Toggle the state for the clicked item
		setAccordianStates(prevState => ({
			...prevState,
			[id]: !prevState[id],
		}));
	};

	return (
		<>
			<Modal
				show={isApplicationMatchModalOpen}
				onClose={() => {
					setIsApplicationMatchModalOpen(false);
					setCurrentLevelData([]);
				}}
				customStyle={{
					width: '100%',
					minWidth: '95%',
					margin: 'auto',
					minHeight: '90vh',
					zIndex: '999',
				}}
			>
				<section>
					<UI.ImgClose
						onClick={() => {
							setIsApplicationMatchModalOpen(false);
							setCurrentLevelData([]);
						}}
						src={imgClose}
						alt='close'
					/>
					<DedupeMatchTable data={currentLevelData} />
					{/* <DedupeMatchTable data={dedupedata} /> */}
				</section>
			</Modal>
			{data?.map((item, itemIndex) => {
				const isAccordianOpen = accordianStates[item.id];
				return (
					<UI_SECTIONS.AccordianWrapper key={`accordian-${itemIndex}`}>
						<UI_SECTIONS.AccordianHeader>
							<UI_SECTIONS.AccordianHeaderData>
								<strong>{item.headerName}</strong>
							</UI_SECTIONS.AccordianHeaderData>
							<UI_SECTIONS.AccordianHeaderData
								style={{
									flex: 'none',
								}}
							>
								<UI_SECTIONS.AccordianIcon
									src={expandIcon}
									alt='toggle'
									onClick={() => toggleAccordian(item.id)}
									style={{
										transform: isAccordianOpen
											? 'rotate(270deg)'
											: 'rotate(90deg)',
									}}
								/>
							</UI_SECTIONS.AccordianHeaderData>
						</UI_SECTIONS.AccordianHeader>
						<UI_SECTIONS.AccordianBody isOpen={isAccordianOpen}>
							{isAccordianOpen && (
								<div>
									{item?.matchLevel?.map(matchType => (
										<UI.CustomerListCard>
											<UI.CustomerListCardItem>
												<stron>{matchType?.name || 'Application Match'}</stron>
											</UI.CustomerListCardItem>
											<UI.CustomerListCardItem>
												<strong>
													{matchType?.data?.length || dedupedata?.length}
												</strong>
												{' duplicates found'}
											</UI.CustomerListCardItem>
											<UI.CustomerListCardItem>
												<Button
													onClick={() => {
														// fetchDedupeCheckData();
														setCurrentLevelData(dedupedata);
														// setCurrentLevelData(matchType?.data);
														setIsApplicationMatchModalOpen(true);
													}}
												>
													Re-Initiate
												</Button>
											</UI.CustomerListCardItem>
										</UI.CustomerListCard>
									))}
								</div>
							)}
						</UI_SECTIONS.AccordianBody>
					</UI_SECTIONS.AccordianWrapper>
				);
			})}
		</>
	);
};

export default DedupeAccordian;
