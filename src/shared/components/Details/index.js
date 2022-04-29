import React, { useState, useContext, useEffect } from 'react';
import Divider from '../Divider';
import Input from '../Input';
import './style.scss';
import { handleChange, handleSubType } from '../../../utils/helper';
import { UserContext } from '../../../reducer/userReducer';
import { getVehicleList } from '../../../utils/requests';

export default function DetailsComponent(props) {
	const [defaultVal, setDefault] = useState(true);
	const { data } = props;
	const {
		state: { userDetails },
	} = useContext(UserContext);

	var dval;

	const getDefaultValues = el => {
		var val;
		if (!props.subType) {
			const d = JSON.parse(sessionStorage.getItem('applicantData'));
			if (data?.label !== 'Loan Details') {
				if (el.label !== ('Permanent Address' || 'Present Address')) {
					const n = d?.applicantData;
					val = n && n[el.key];
				}

				if (props.head === 'Permanent Address') {
					const n = d?.applicantData?.address[0];
					val = n && n[el.key];
				}

				if (props.head === 'Present Address') {
					const n = d?.applicantData?.address[1];
					val = n && n[el.key];
				}
			} else if (data.label === 'Loan Details') {
				const n = d?.loanData;
				val = n && n[el.key];
			}
		}

		if (props.subType) {
			const d = JSON.parse(sessionStorage.getItem('coApplicantData'));
			if (data?.label !== 'Loan Details') {
				if (el.label !== ('Permanent Address' || 'Present Address')) {
					const n = d?.applicantData;
					val = n && n[el.key];
				}

				if (props.head === 'Permanent Address') {
					const n = d?.applicantData?.address[0];
					val = n && n[el.key];
				}

				if (props.head === 'Present Address') {
					const n = d?.applicantData?.address[1];
					val = n && n[el.key];
				}
			} else if (data.label === 'Loan Details') {
				const n = d?.loanData;
				val = n && n[el.key];
			}
		}

		return val;
	};

	const [d, setD] = useState(null);

	useEffect(() => {}, []);

	const f = (e, item) => {
		const h = e;
		setTimeout(() => {
			getVehicleList(h, userDetails.userToken, item).then(res => {
				setD(res);
				return res;
			});
		}, 3000);
	};

	return (
		<Divider
			split={props.split}
			head={props.head}
			headLink={props.headLink}
			change={setDefault}>
			{data &&
				data.data &&
				data.data.map(
					el =>
						el.visibility && (
							<Input
								placeholder={el.label}
								name={el.label}
								type={el.type}
								options={el.option}
								label={el.label}
								name={el.key}
								t={el.mandatory === false ? 0 : 1}
								sideHead={props.sideHead}
								onChange={e =>
									props.subType
										? handleSubType(e, el, props)
										: handleChange(e, el, props)
								}
								defaultValue={getDefaultValues(el)}
								isSearchable={el.searchable}
								onInputChange={e => f(e, el)}
							/>
						)
				)}
		</Divider>
	);
}
