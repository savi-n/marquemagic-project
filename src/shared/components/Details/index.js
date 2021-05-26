import React, { useState } from 'react';
import Divider from '../Divider';
import Input from '../Input';
import './style.scss';

export default function DetailsComponent(props) {
	const [defaultVal, setDefault] = useState(true);
	const { data } = props;

	return (
		<Divider split={props.split} head={props.head} headLink={props.headLink} change={setDefault}>
			{data &&
				Object.keys(data).map(item =>
					data[item].data.map(
						el =>
							el.visibility && (
								<Input
									placeholder={el.label}
									name={el.label}
									type={el.option.length > 0 ? 'dropdown' : 'text'}
									data={el.option.length && el.option}
									label={el.label}
									key={el.key}
									onChange={props.handleChange}
									sideHead={props.sideHead}
								/>
							)
					)
				)}
		</Divider>
	);
}
