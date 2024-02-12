/* A file contains modal that displays information of the company/companies against the uploaded PAN.
  User can select the company and proceed to next page*/

import { useState } from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import Button from './Button';
import { useToasts } from 'components/Toast/ToastProvider';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import InputField from './inputs/InputField';
import { UPDATE_COMPANY_CIN } from '_config/app.config';
import axios from 'axios';

const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
`;
const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;
const PanConfirm = styled.div`
	margin-top: 100px;
	margin-bottom: 10px;
	text-align: center;
	font-size: 24px;
	font-weight: 600px;
	@media (max-width: 700px) {
		font-size: 22px;
		font-weight: 500;
		margin-top: 50px;
	}
`;

const Company = styled.div`
	margin: 10px;
	width: 84%;
	height: 100px;
	text-align: center;
	box-shadow: rgb(11 92 255 / 16%) 5px 2px 5px 1px;
	padding: 28px;
	cursor: pointer;
	border-radius: 10px;
	@media (max-width: 700px) {
		width: 80%;
		height: auto;
	}
`;

const CheckboxSameAs = styled.input`
	margin-right: 10px;
	height: 20px;
	width: 20px;
`;

// const FieldWrapper = styled.div`
// 	width: 80%;
// `;
const Field = styled.div`
	margin: 40px 0;
	width: 100%;
`;

const FieldWrapGrid = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
`;

export default function CompanySelectModal({
	companyList,
	setCompanyList,
	show,
	onClose,
	onCompanySelect,
	companyNameSearch,
	companyName,
	formState,
	panExtractionData = {},
	searchingCompanyName = false,
	proceedToNextSection,
}) {
	//const { register } = useForm();
	const { addToast } = useToasts();
	const [company, setCompany] = useState(panExtractionData?.companyName);
	const [isCompanyApi, setIsCompanyApi] = useState(false);
	const [checkBoxChecked, setCheckBoxChecked] = useState(false);
	const [cinNumber, setCinNumber] = useState('');
	// console.log('company information', companyList);

	const onCinNumberSearch = async cinNumber => {
		try {
			const payload = { cin: cinNumber };
			const cinNumberResp = await axios.post(UPDATE_COMPANY_CIN, payload);
			if (cinNumberResp?.data?.status === 'ok') {
				setCompanyList([{ ...cinNumberResp?.data?.data }]);
				setCheckBoxChecked(false);
				setCinNumber('');
			}
			if (cinNumberResp?.data?.status === 'nok') {
				console.error('Error: Failed to fetch Company Data.');
			}
		} catch (error) {
			console.error('Error in fetching Data : ', error);
		}
	};

	const CompanyListData = ({ companyList, onCompanySelect }) => {
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{!checkBoxChecked &&
					companyList.map(company => (
						<Company
							key={company.id}
							onClick={() =>
								onCompanySelect(company.CORPORATE_IDENTIFICATION_NUMBER)
							}
						>
							<div>{company.COMPANY_NAME}</div>
							<div>CIN : {company.CORPORATE_IDENTIFICATION_NUMBER}</div>
						</Company>
					))}
				<FieldWrapGrid key={`field-hello-hello2`}>
					<CheckboxSameAs
						type='checkbox'
						id={'check-box-compnay'}
						checked={checkBoxChecked}
						onChange={() => {
							setCheckBoxChecked(!checkBoxChecked);
						}}
					/>
					<label
						htmlFor={'check-box-company'}
						onClick={() => {
							setCheckBoxChecked(!checkBoxChecked);
						}}
						style={{ cursor: 'pointer' }}
					>
						{
							'Company name not in the list? Check this to search with CIN number instead for better results!'
						}
					</label>
				</FieldWrapGrid>
				<UI_SECTIONS.FieldWrapGrid key={`field-hello-hello3`} />
				{checkBoxChecked && (
					<>
						<Field>
							<InputField
								name='CIN Number'
								width={'100%'}
								placeholder='Enter CIN Number'
								value={cinNumber?.toUpperCase().trim()}
								onChange={e => {
									setCinNumber(e.target.value);
								}}
							/>
						</Field>
						<Button
							name='Search CIN'
							onClick={() => {
								onCinNumberSearch(cinNumber);
							}}
						/>
					</>
				)}
				<UI_SECTIONS.FieldWrapGrid />
			</div>
		);
	};

	return (
		<Modal
			show={show}
			onClose={() => {
				onClose();
				setCheckBoxChecked(false);
			}}
			width='50%'
		>
			<ImgClose onClick={onClose} src={imgClose} alt='close' />
			<PanConfirm>
				Confirm the Entity for {panExtractionData?.panNumber}{' '}
			</PanConfirm>
			<Wrapper>
				{companyList.length ? (
					<CompanyListData
						companyList={companyList}
						onCompanySelect={onCompanySelect}
					/>
				) : (
					<>
						{!checkBoxChecked && (
							<section
								className='w-full flex flex-col items-center'
								style={{ width: '84%' }}
							>
								<section className='py-10'>
									No data found for the given company
								</section>
								<input
									className='p-2 border w-full rounded-lg'
									placeholder='Company Name'
									defaultValue={panExtractionData?.companyName}
									onChange={e => setCompany(e.target.value)}
								/>
								<section
									className={`flex ${
										isCompanyApi ? '' : 'flex-col'
									} py-8 items-center`}
								>
									<Button
										onClick={() => {
											companyNameSearch(company);
											setIsCompanyApi(true);
											addToast({
												message:
													'If Company data is not fetched, Click on Proceed to complete the application',
												type: 'warning',
											});
										}}
										isLoader={searchingCompanyName}
										name={searchingCompanyName ? 'Please wait...' : 'Search'}
										disabled={
											searchingCompanyName ||
											!company ||
											!panExtractionData?.companyName
										}
										fill
									/>
									{isCompanyApi && (
										<Button
											customStyle={{ marginLeft: '2px' }}
											name='Proceed'
											fill
											onClick={proceedToNextSection}
										/>
									)}
								</section>
							</section>
						)}
						<FieldWrapGrid key={`field-hello-hello2`}>
							<CheckboxSameAs
								type='checkbox'
								id={'check-box-compnay'}
								checked={checkBoxChecked}
								onChange={() => {
									setCheckBoxChecked(!checkBoxChecked);
								}}
							/>
							<label
								htmlFor={'check-box-company'}
								onClick={() => {
									setCheckBoxChecked(!checkBoxChecked);
								}}
								style={{ cursor: 'pointer' }}
							>
								{
									'Company not found? Check this to search with CIN number instead for better results!'
								}
							</label>
						</FieldWrapGrid>
						<UI_SECTIONS.FieldWrapGrid key={`field-hello-hello3`} />
						{checkBoxChecked && (
							<>
								<Field style={{ width: '80%' }}>
									<InputField
										name='CIN Number'
										width={'80%'}
										placeholder='Enter CIN Number'
										value={cinNumber?.toUpperCase().trim()}
										onChange={e => {
											setCinNumber(e.target.value);
										}}
									/>
								</Field>
								<Button
									name='Proceed With CIN number'
									onClick={() => {
										onCinNumberSearch(cinNumber);
									}}
								/>
							</>
						)}
						<UI_SECTIONS.FieldWrapGrid />
					</>
				)}
			</Wrapper>
		</Modal>
	);
}
