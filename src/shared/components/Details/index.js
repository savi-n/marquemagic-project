import React, { useState } from 'react';
import Divider from '../Divider';
import Input from '../Input';
import './style.scss';
import { handleChange, handleSubType } from '../../../utils/helper';

export default function DetailsComponent(props) {
	const [defaultVal, setDefault] = useState(true);
	const { data } = props;
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
								r={el.inrupees}
								i={el.isInfo}
								onChange={e =>
									props.subType ? handleSubType(e, el, props) : handleChange(e, el, props)
								}
							/>
						)
				)}
		</Divider>
	);
}
