import { useEffect, useState } from 'react';
import ButtonS from '../../components/Button';
import { getLoanDetails, getLoan } from '../utils/requests';
import Loading from '../../components/Loading';

export default function Collateral({
	collateral,
	loanId,
	product,
	onUpdate,
	disabled,
	setViewLoan,
}) {
	//const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [fields, setFields] = useState(null);
	const [formValues, setFormValues] = useState({});
	const onfieldChanges = e => {
		const { name, value } = e.target;
		setFormValues({ ...formValues, [name]: value });
	};

	useEffect(() => {
		// console.log(collateral);
		setLoading(true);
		getLoanDetails(loanId).then(loanDetails => {
			// if (loanDetails) {
			// 	setData(loanDetails);
			// }
			if (loanDetails) {
				getLoan().then(resp => {
					resp.data?.map(
						k =>
							product.includes(k?.name) &&
							Object.keys(k.product_id).map(
								y =>
									y === loanDetails.directors[0].income_type &&
									getLoan(k.id).then(res => {
										res.length > 7 && setFields(res);
										// console.log("! ",res);
									})
							)
					);
					setLoading(false);
				});
			}
		});
		// eslint-disable-next-line
	}, []);

	const gateway = data => {
		Object.keys(collateral).map(key => {
			if (key !== 'accountDetails' && key === data?.db_name) {
				data.default_value = collateral[key];
			}
			return null;
		});
		if (data.type === 'select') {
			return (
				<select
					disabled={disabled}
					onChange={onfieldChanges}
					name={data.db_name}
					defaultValue={data.default_value}
					className='p-2 rounded-md text-lg border w-full'>
					{data.options.map(op => (
						<option name={op.name} value={op.value}>
							{op.name}
						</option>
					))}
				</select>
			);
		} else {
			return (
				<input
					name={data.db_name}
					disabled={disabled}
					onChange={onfieldChanges}
					className='p-2 rounded-md text-lg border w-full'
					type={data.type}
					placeholder={data.placeholder}
					defaultValue={data.default_value}
				/>
			);
		}
	};

	const update = val => {
		let updatedData = { ...collateral, ...val };
		const jsonStr = JSON.stringify(updatedData);
		onUpdate(jsonStr);
	};
	// console.log(fields);
	return !loading ? (
		<div>
			<section className='flex flex-col gap-y-5 w-8/12'>
				<div className='text-blue-600 font-medium text-xl py-8'>
					Collateral details
				</div>

				{fields &&
					fields?.map(
						el =>
							el.id === 'security-details' && (
								<section className='flex flex-col gap-y-4'>
									{Object.keys(el.fields).map(
										item =>
											el.fields[item].label === 'CollateralDetails' &&
											el.fields[item].data.map(e => (
												<section className='w-full flex gap-y-4 items-center justify-evenly'>
													<label className='w-full text-lg'>
														{e.placeholder}
													</label>
													{gateway(e)}
												</section>
											))
									)}
								</section>
							)
					)}
				<div className='text-blue-600 font-medium text-xl py-8'>
					Linkage details
				</div>
				{fields &&
					fields?.map(
						el =>
							el.id === 'security-details' && (
								<section className='flex flex-col gap-y-4'>
									{Object.keys(el.fields).map(
										item =>
											el.fields[item].label === 'Linkage Details' &&
											el.fields[item].data.map(e => (
												<section className='w-full flex gap-y-4 items-center justify-evenly'>
													<label className='w-full text-lg'>
														{e.placeholder}
													</label>
													{gateway(e)}
												</section>
											))
									)}
								</section>
							)
					)}
				<div className='text-blue-600 font-medium text-xl py-8'>
					Property details
				</div>

				{fields &&
					fields?.map(
						el =>
							el.id === 'security-details' && (
								<section className='flex flex-col gap-y-4'>
									{Object.keys(el.fields).map(
										item =>
											el.fields[item].label === 'Property Details' &&
											el.fields[item].data.map(e => (
												<section className='w-full flex gap-y-4 items-center justify-evenly'>
													<label className='w-full text-lg'>
														{e.placeholder}
													</label>
													{gateway(e)}
												</section>
											))
									)}
								</section>
							)
					)}
				<div className='text-blue-600 font-medium text-xl py-8'>
					Other details
				</div>
				{fields &&
					fields?.map(
						el =>
							el.id === 'security-details' && (
								<section className='flex flex-col gap-y-4'>
									{Object.keys(el.fields).map(
										item =>
											el.fields[item].label === 'Other Details' &&
											el.fields[item].data.map(e => (
												<section className='w-full flex gap-y-4 items-center justify-evenly'>
													<label className='w-full text-lg'>
														{e.placeholder}
													</label>
													{gateway(e)}
												</section>
											))
									)}
								</section>
							)
					)}
			</section>
			<br />
			<ButtonS
				type='submit'
				name='Update'
				fill
				disabled={disabled}
				onClick={() => {
					update(formValues);
					setViewLoan(false);
				}}
			/>
		</div>
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

// setViewLoan(false)
