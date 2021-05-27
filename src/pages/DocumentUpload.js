import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { oneOf } from 'prop-types';
import Button from '../shared/components/Button';
import CheckBox from '../shared/components/Checkbox/CheckBox';
import FileUpload from '../shared/components/FileUpload/FileUpload';
import Layout from '../Layout';
import Footer from '../shared/components/Footer';
import Modal from '../shared/components/Modal';
import NcLoader from '../shared/components/NcLoader';
import './style.scss';
import Input from '../shared/components/Input';
import { getBankList } from '../utils/requests';

const Colom1 = styled.div`
	flex: 1;
	background: ${({ theme }) => theme.themeColor1};
	padding: 50px;
`;

const Colom2 = styled.div`
	width: 40%;
	background: ${({ theme }) => theme.themeColor1};
	padding: 50px 30px;
`;
const UploadWrapper = styled.div`
	padding: 30px 0;
`;

const DocsCheckboxWrapper = styled.div`
	margin: 20px 0;
`;

const text = {
	grantCibilAcces: 'I here by give consent to pull my CIBIL records',
	declaration: 'I here do declare tat what is stated above is true to the best of my knowledge and  belief'
};

const documentsRequired = [
	'Latest Three months salary slip',
	'Latest Six months bank account statement(in which the salary gets credited)',
	'Last 2 years ITR(in pdf)',
	'Quotation letter',
	'SB account statment for the latest six months(other banks)',
	'Form 16 from the Employee of the borrower',
	'Any other relevent doxuments'
];

export default function DocumentUpload(props) {
	const { userType } = props;
	const [checkbox1, setCheckbox1] = useState(false);
	const [checkbox2, setCheckbox2] = useState(false);

	const [uploadFiles, setUploadFiles] = useState([]);
	const [otherBankModal, setOtherBankModalToggle] = useState(false);
	const [otherBanksData, setOtherBanksData] = useState(null);
	const [selectedBank, setSelectedBank] = useState(null);
	const [bankList, toggleDisplayList] = useState(true);
	const [selectedBankDetails, setSelectedBankDetails] = useState(null);

	const otherBankFetch = async () => {
		setOtherBankModalToggle(!otherBankModal);
		const data = await getBankList('BANK', false, false);
		setOtherBanksData(data);
	};

	const handleFileUpload = files => {
		setUploadFiles([...uploadFiles, ...files]);
	};

	const handleModalDisplay = () => {
		if (bankList) {
			toggleDisplayList(false);
			const data = otherBanksData && otherBanksData.filter(el => el.name === selectedBank);
			setSelectedBankDetails(data);
		}
	};

	return (
		<>
			<Layout>
				<section className='flex flex-col'>
					<section className='flex justify-between'>
						<section>
							<h2 className='text-xl'>
								{userType ?? 'Help Us with your'} <span className='text-blue-600'>Document Upload</span>
							</h2>
							<UploadWrapper>
								<FileUpload onDrop={handleFileUpload} />
							</UploadWrapper>
							{uploadFiles.map(files => (
								<div>{files.name}</div>
							))}
							<section className='flex justify-between w-9/12 items-start'>
								<section className='grid gap-y-6'>
									<Button>Get CUB Statement</Button>
									<Button>Get ITR documents</Button>
								</section>
								<Button onClick={() => otherBankFetch()}>Get Other Bank Statements</Button>
							</section>
							<section className='flex flex-col justify-center pt-10 gap-y-3'>
								<CheckBox
									name={text.grantCibilAcces}
									checked={checkbox1}
									onChange={state => setCheckbox1(state)}
									bg='blue'
								/>
								<CheckBox
									name={text.declaration}
									checked={checkbox2}
									onChange={state => setCheckbox2(state)}
									bg='blue'
								/>
							</section>
						</section>
					</section>
					{props.footer && (
						<section className='py-24'>
							<Footer
								submitHandler={props.submitHandler}
								submit={props.submit}
								cancel={props.cancel}
								click={props.click}
							/>
						</section>
					)}
				</section>
			</Layout>
			<section className='w-1/4 bg-gray-100 p-10 absolute right-0' style={{ height: 'calc(100vh - 80px)' }}>
				<h3>Documents Required</h3>
				<div>
					{documentsRequired.map(docs => (
						<DocsCheckboxWrapper key={uuidv4()}>
							<CheckBox name={docs} checked={true} disabled round bg='green' />
						</DocsCheckboxWrapper>
					))}
				</div>
			</section>
			<Modal
				width='lg'
				margin='base'
				show={otherBankModal}
				title={`${bankList ? 'Select Bank' : ''}`}
				onClose={() => {
					setOtherBanksData(null);
					setOtherBankModalToggle(false);
					toggleDisplayList(true);
				}}
				back={bankList ? false : true}
				onBack={() => toggleDisplayList(true)}
			>
				{otherBanksData && (
					<>
						{bankList ? (
							<section className='flex grid grid-cols-1 sm:grid sm:grid-cols-2 sm:gap-x-32 gap-y-4 w-full sm:px-6'>
								{otherBanksData &&
									otherBanksData.map(item => (
										<section
											key={item.id}
											className='border border-gray-300 p-2 cursor-pointer px-4 rounded-xl'
										>
											<label className='flex items-center justify-between w-full'>
												<div className='flex items-center gap-x-4 justify-between w-3/12 sm:w-1/2'>
													<img className='h-8 w-8 sm:h-10 sm:w-10' src={item.logo} />
													<p className='w-full text-left'>{item.name}</p>
												</div>
												<input
													className='sm:w-1/6 radio'
													type='radio'
													name='banks'
													value={item.name}
													onChange={e => setSelectedBank(e.target.value)}
												/>
											</label>
										</section>
									))}
							</section>
						) : (
							<>
								{selectedBankDetails && (
									<section className='flex flex-col gap-y-10'>
										<section className='flex flex-col items-center justify-center'>
											<img className='h-16 w-16' src={selectedBankDetails[0].logo} />
										</section>
										<section className='flex gap-y-2 flex-col items-center justify-center'>
											<Input placeholder='User ID' p='3' />
											<Input placeholder='Password' p='3' />
										</section>
									</section>
								)}
							</>
						)}
						<section className='pt-6'>
							<Button type='blue' onClick={() => handleModalDisplay()}>
								&nbsp; {bankList ? 'Next' : 'Login'} &nbsp;
							</Button>
						</section>
					</>
				)}
				{!otherBanksData && <NcLoader />}
			</Modal>
		</>
	);
}

DocumentUpload.defaultProps = {
	userType: null
};

DocumentUpload.propTypes = {
	userType: oneOf(['', 'Gurantor', 'Co-applicant'])
};
