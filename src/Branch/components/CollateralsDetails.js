import { useState, useEffect } from 'react';
import {
	BRANCH_COLLATERAL_DETAILS,
	BRANCH_COLLATERAL_SELCTED,
	BRANCH_COLLATERAL_UPDATE,
} from '../../_config/branch.config';
import styled from 'styled-components';
import Collateral from './Collateral';
import useFetch from '../../hooks/useFetch';
import useForm from '../../hooks/useForm';
import Button from '../shared/components/Button';
import ButtonS from '../../components/Button';
import Loading from '../../components/Loading';

const WrapContent = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const FieldWrapper = styled.div`
	padding: 20px 0;
	width: 100%;
`;

const Wrap = styled.form`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const AlignButtons = styled.div`
	display: flex;
	flex-direction: column;
`;

const SetButton = styled.button`
	margin: 1rem;
`;

const Wrapper = styled.form`
	width: 30%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const pageStates = {
	fetch: 'fetch',
	available: 'available',
	next: 'next',
	saved: 'saved',
};

export default function CollateralsDetails({
	loanId,
	product,
	savedCollateral,
	initialCollateral,
	disabled,
	setViewLoan,
}) {
	const { newRequest } = useFetch();
	const { register, handleSubmit, formState } = useForm();
	const [fetching, setFetching] = useState(false);
	const [pageState, setPageState] = useState(pageStates.fetch);
	const [colateralDetails, setColateralDetails] = useState(
		initialCollateral ? initialCollateral : null
	);
	const [seletedCollateral, setSelectedCollateral] = useState(
		savedCollateral ? savedCollateral : null
	);
	const [noOfCollaterals, setNoOfCollaterals] = useState(null);
	const [updatedCollateral, setUpdatedCollateral] = useState(null);
	const [saveUpdate, setSaveUpdate] = useState('save');
	const [loading, setLoading] = useState(false);

	const onCollateralUpdate = updateCollateral => {
		setUpdatedCollateral(updateCollateral);
		// setSelectedCollateral(updatedCollateral);
		if (updateCollateral != null) {
			onUpdateCollateral(updateCollateral);
		}
	};

	useEffect(() => {
		setLoading(true);
		if (seletedCollateral !== null) {
			setPageState(pageStates.next);
		} else if (colateralDetails !== null) {
			setPageState(pageStates.available);
		}
		setLoading(false);
	});

	const fetchCollateralDetails = async url => {
		const fetchCollateral = await newRequest(
			url,
			{
				method: 'POST',
			},
			{
				Authorization: `Bearer ${sessionStorage.getItem('token')}`,
			}
		);
		return fetchCollateral;
	};

	const getCollaterals = async ({ custAccNo }) => {
		setFetching(true);
		const colateralDataReq = await fetchCollateralDetails(
			BRANCH_COLLATERAL_DETAILS({ loanID: loanId, custAccNo })
		);
		const colateralDataRes = colateralDataReq?.data;

		setColateralDetails(colateralDataRes?.data?.initial_collateral);
		setNoOfCollaterals(colateralDataRes?.data?.initial_collateral.length);
		setPageState(pageStates.available);
		setFetching(false);
	};

	const onSubmitCollateral = async ({ collateralNumber }) => {
		setFetching(true);
		// console.log(saveUpdate);
		const colateralSaveDataReq = await fetchCollateralDetails(
			BRANCH_COLLATERAL_SELCTED({
				loanId: loanId,
				collateral: collateralNumber,
			})
		);
		const colateralSaveDataRes = colateralSaveDataReq.data;
		setSelectedCollateral(
			colateralSaveDataRes.data
				? colateralSaveDataRes.data
				: colateralSaveDataRes
		);
		setPageState(pageStates.next);
		setFetching(false);
	};

	const onUpdateCollateral = async collateralType => {
		setFetching(true);
		const colateralUpdateDataReq = await fetchCollateralDetails(
			BRANCH_COLLATERAL_UPDATE({
				loanId: loanId,
				collateral: collateralType,
			})
		);
		const colateralUpdateDataRes = colateralUpdateDataReq?.data;
		setFetching(false);
	};

	let no = 1;
	return !loading ? (
		<>
			{pageState === pageStates.fetch && (
				<WrapContent>
					<Wrapper onSubmit={handleSubmit(getCollaterals)}>
						<FieldWrapper>
							{register({
								name: 'custAccNo',
								placeholder: 'Enter Customer / Account Number',
								value: formState?.values?.custAccNo,
							})}
						</FieldWrapper>
						<ButtonS
							type='submit'
							name='Submit'
							fill
							disabled={!formState.values?.custAccNo || fetching}
						/>
					</Wrapper>
				</WrapContent>
			)}

			{pageState === pageStates.available && (
				<WrapContent>
					<Wrapper onSubmit={handleSubmit(onSubmitCollateral)}>
						<FieldWrapper>
							{register({
								name: 'collateralNumber',
								type: 'select',
								placeholder: 'Select Collateral',
								options: colateralDetails.map(col => ({
									value: col.collateralNumber,
									name: col.collateralNumber,
								})),
								value: formState?.values?.collateralNumber,
							})}
						</FieldWrapper>
						<ButtonS
							type='submit'
							name='Save Collateral'
							fill
							disabled={!formState?.values?.collateralNumber || fetching}
						/>
					</Wrapper>
				</WrapContent>
			)}

			{pageState === pageStates.next && (
				<>
					<div>
						<Collateral
							collateral={seletedCollateral}
							loanId={loanId}
							product={product}
							onUpdate={onCollateralUpdate}
							disabled={disabled}
							setViewLoan={setViewLoan}
						/>
					</div>
				</>
			)}
		</>
	) : (
		loading && (
			<section className='flex items-center justify-center'>
				<section className='w-full'>
					<Loading />
				</section>
			</section>
		)
	);
}
