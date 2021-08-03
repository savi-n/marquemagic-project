import Button from '../shared/components/Button';

const valueConversion = {
	Thousand: 1000,
	Lakhs: 100000,
	Crores: 10000000,
	Millions: 1000000,
	One: 1
};

const amountFields = ['loan_amount'];

export default function ApplicantDetails({ fields, disabled, onfieldChanges, data, mapper, e, d, clickSub }) {
	const amountConverter = (value, name) => {
		if (amountFields.includes(name)) {
			return value * valueConversion[data?.assets_value_um || 'One'];
		}

		return value;
	};

	return (
		<>
			{fields && fields.length > 7 ? (
				fields.map(
					(i, idx) =>
						i &&
						i.id !== 'guarantor-document-upload' &&
						i.id !== 'cub-document-upload' &&
						i.id !== 'guarantor-details' &&
						idx > 1 &&
						idx < 7 && (
							<section className='flex flex-col gap-y-4 gap-x-20'>
								<p className='text-blue-700 font-medium text-xl pb-8 p1'>{i.name}</p>

								{i.fields[i.name === 'Loan Details' ? ['loan-details'] : i?.id]?.data.map(
									el =>
										el && (
											<section className='flex space-evenly items-center'>
												<label className='w-1/2'>{el.placeholder}</label>
												{el.type !== 'select' ? (
													<>
														{i.name === 'Guarantor Details' &&
															data?.directors?.map(item =>
																item.type_name === 'Guarantor' && (
																	<input
																		disabled={disabled}
																		className='rounded-lg p-4 border w-1/3'
																		name={el.db_name}
																		onChange={onfieldChanges}
																		defaultValue={item[el.db_name] || 'N/A'}
																	/>
																)
															)}

														{i.name === 'Business Details' && (
															<input
																disabled={disabled}
																className='rounded-lg p-4 border mx-3 w-1/3 n1'
																name={el.db_name}
																onChange={onfieldChanges}
																defaultValue={data?.business_id[el.db_name] || 'N/A'}
															/>
														)}

														{i.name === 'Loan Details' && (
															<>
																<input
																	disabled={disabled}
																	className='rounded-lg p-4 border mx-3 w-1/3 n2'
																	name={el.db_name}
																	onChange={onfieldChanges}
																	defaultValue={amountConverter(
																		data[el.db_name] ||
																		data?.loanAssestsDetails?.[0]?.[
																		el.db_name
																		] ||
																		'N/A',
																		el.db_name
																	)}
																/>
															</>
														)}
														{i.name === 'Personal Details' && (
															<>
																<input
																	disabled={disabled}
																	className='rounded-lg p-4 border mx-3 w-1/3 n3'
																	name={el.db_name}
																	onChange={onfieldChanges}
																	defaultValue={
																		data?.directors[0][el.db_name] || 'N/A'
																	}
																/>
															</>
														)}
														{i.name === 'Address Details' &&
															data?.business_id?.business_address.map(o => (
																<>
																	<input
																		disabled={disabled}
																		className='rounded-lg p-4 border mx-3 w-1/3 n4'
																		name={el.db_name}
																		onChange={onfieldChanges}
																		defaultValue={o[el.db_name] || 'N/A'}
																	/>
																</>
															))}

														{i.name === 'EMI Details' &&
															data?.loanFinancialDetails?.map(o => (
																<>
																	<input
																		disabled={disabled}
																		className='rounded-lg p-4 border mx-3 w-1/3 n5'
																		name={el.db_name}
																		onChange={onfieldChanges}
																		defaultValue={
																			o[el.db_name]
																				? JSON.parse(o[el.db_name]).map(
																					r => r[el.db_name]
																				)
																				: 'N/A' || 'N/A'
																		}
																	/>
																</>
															))}
														{i.name === 'Subsidiary Details' && (
															<input
																disabled={disabled}
																className='rounded-lg p-4 border mx-3 w-1/3 n7'
																name={el.db_name}
																onChange={onfieldChanges}
																defaultValue={data?.business_id[el.db_name] || 'N/A'}
															/>
														)}
														{i.name === 'Bank Details' &&
															data?.loanFinancialDetails?.map(o => (
																<>
																	<input
																		disabled={disabled}
																		className='rounded-lg p-4 border mx-3 w-1/3 n8'
																		name={el.db_name}
																		onChange={onfieldChanges}
																		defaultValue={o[el.db_name] || 'N/A'}
																	/>
																</>
															))}

														{i.name === 'Shareholder Details' ? (
															data?.businessShareData.length > 0 ? (
																data?.businessShareData.map((o, idx) => (
																	<>
																		<input
																			disabled={disabled}
																			className='rounded-lg p-4 border mx-3 w-1/3 n9'
																			name={el.db_name}
																			onChange={onfieldChanges}
																			defaultValue={o[el.db_name] || 'N/A'}
																		/>
																	</>
																))
															) : (
																<input
																	disabled={disabled}
																	className='rounded-lg p-4 border mx-3 w-1/3 n10'
																	name={el.db_name}
																	onChange={onfieldChanges}
																	defaultValue={'N/A'}
																/>
															)
														) : null}
														{i.name === 'Reference Details' ? (
															data?.loanReferenceData.length > 0 ? (
																data?.loanReferenceData.map((o, idx) => (
																	<>
																		<input
																			disabled={disabled}
																			className='rounded-lg p-4 border mx-3 w-1/3  n11'
																			name={el.db_name}
																			onChange={onfieldChanges}
																			defaultValue={o[el.db_name] || 'N/A'}
																		/>
																	</>
																))
															) : (
																<input
																	disabled={disabled}
																	className='rounded-lg p-4 border mx-3 w-1/3 n12'
																	name={el.db_name}
																	onChange={onfieldChanges}
																	defaultValue={'N/A'}
																/>
															)
														) : null}
													</>
												) : null}

												{el.type === 'select' && (
													<>
														{i.name === 'Shareholder Details' &&
															data?.businessShareData.map((o, idx) => (
																<select
																	disabled={disabled}
																	className='rounded-lg p-4 border mx-3 w-1/3 '
																	name={el.db_name}
																	onChange={onfieldChanges}
																>
																	{el.options &&
																		el.options.map(r => <option>{r?.name}</option>)}
																</select>
															))}
														{i.name !== 'Shareholder Details' && (
															<select
																disabled={disabled}
																className='rounded-lg p-4 border mx-3 w-1/3'
																name={el.db_name}
																onChange={onfieldChanges}
															>
																{el.options &&
																	el.options.map(r => <option>{r?.name}</option>)}
															</select>
														)}
													</>
												)}
											</section>
										)
								)}
							</section>
						)
				)
			) : (
				<>
					{mapper[e] &&
						Object.keys(mapper[e]).map(i => (
							<section>
								{d()[e] &&
									d()[e].map(
										j =>
											j !== false && (
												<section className='flex flex-col gap-y-4 gap-x-20'>
													<p className='text-blue-700 font-medium text-xl pb-8 p2'>{i}</p>

													{j &&
														Object.keys(j).map(
															k =>
																mapper[e][i] &&
																Object.keys(mapper[e][i]).map(
																	l =>
																		l === k && (
																			<section className='flex space-evenly items-center'>
																				<label className='w-1/2'>
																					{mapper[e][i][k]}
																				</label>
																				<input
																					className='rounded-lg p-4 border mx-3'
																					disabled={disabled}
																					name={k}
																					onChange={onfieldChanges}
																					placeholder={mapper[e][i][k]}
																					defaultValue={j[k]}
																				/>
																			</section>
																		)
																)
														)}
												</section>
											)
									)}
							</section>
						))}
				</>
			)}
			<Button onClick={() => clickSub()} disabled={disabled} type='blue' rounded='rfull' size='small'>
				Submit
			</Button>
		</>
	);
}
