import React, { useState } from 'react';
import Divider from '../Divider';
import Input from '../Input';
import './style.scss';
import { handleChange, handleSubType } from '../../../utils/helper';

export default function DetailsComponent(props) {
	const [defaultVal, setDefault] = useState(true);
	const { data } = props;

	const getDefaultValues = el => {
		var val;
		if (!props.subType) {
			const d = JSON.parse(localStorage.getItem('applicantData'));
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
			const d = JSON.parse(localStorage.getItem('coApplicantData'));
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

	return (
		<Divider split={props.split} head={props.head} headLink={props.headLink} change={setDefault}>
			{data &&
				data.data &&
				data.data.map(
					el =>
						el.visibility && (
							<Input
								placeholder={el.label}
								name={el.label}
								type={el.type}
								data={el.option.length && el.option}
								label={el.label}
								name={el.key}
								t={el.mandatory === false ? 0 : 1}
								sideHead={props.sideHead}
								onChange={e =>
									props.subType ? handleSubType(e, el, props) : handleChange(e, el, props)
								}
								defaultValue={getDefaultValues(el)}
							/>
						)
				)}
		</Divider>
	);
}
