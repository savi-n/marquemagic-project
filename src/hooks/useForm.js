import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import SearchSelect from '../components/SearchSelect';
import BankList from '../components/inputs/BankList';
import Pincode from '../components/inputs/PinCode';
import DateField from '../components/inputs/DateField';
import InputField from '../components/inputs/InputField';
import SelectField from '../components/inputs/SelectField';
import DisabledInput from '../components/inputs/DisabledInput';

function required(value) {
	return !value;
}

function numberOnly(value) {
	return !Number(value);
}

function validatePattern(pattern) {
	return function(value, pat) {
		pat = typeof pat === 'boolean' ? pattern : pat;
		return !new RegExp(pat).test(value);
	};
}

function limitLength(type) {
	return function(value, limit) {
		if (type === 'max') return value?.length > limit;
		else if (type === 'min') return value?.length < limit;
		return value?.length !== limit;
	};
}

function valueMatchWith(value, matchWith) {
	return !(value === matchWith);
}

function maxValue(value, limit) {
	return +value > +limit;
}

function minValue(value, limit) {
	return +value < +limit;
}

const VALIDATION_RULES = {
	required: {
		func: required,
		message: 'Required Field'
	},
	number: {
		func: numberOnly,
		message: 'Numbers only Allowed'
	},
	email: {
		func: validatePattern(/\S+@\S+\.\S+/g),
		message: 'Invalid Email Address'
	},
	pattern: {
		func: validatePattern(),
		message: 'Pattern Mismatch'
	},
	maxLength: {
		func: limitLength('max'),
		message: 'Exceeds Character Length'
	},
	minLength: {
		func: limitLength('min'),
		message: 'Minimum Character limit'
	},
	length: {
		func: limitLength(),
		message: 'Character Length Mismatch'
	},
	maxValue: {
		func: maxValue,
		message: 'Value Limit Exceedeed'
	},
	minValue: {
		func: minValue,
		message: 'Minimum limit needed'
	},
	valueMatchWith: {
		func: valueMatchWith,
		message: 'Mismatch'
	},
	subAction: {
		func: (value, params) => {
			return params;
		},
		message: 'Upload agreement is mandatory'
	}
};

function validate(rules, value) {
	if (!rules) return false;

	for (const rule in rules) {
		if (VALIDATION_RULES[rule]?.func(value, rules[rule])) {
			return VALIDATION_RULES[rule].message;
		}
	}
}

const MASKS = {
	NumberOnly: value => value?.replace(/[^\d]+/g, '') || '',
	CharacterLimit: (value, n) => String(value).substring(0, n) || '',
	AlphaCharOnly: value => value?.replace(/[^a-zA-Z .]/g, '') || '',
	AlphaNumericOnly: value => value?.replace(/[^a-zA-Z0-9]+$/i, '')
};

function revealMask(masks, value) {
	for (const mask in masks) {
		if (masks[mask]) {
			value = MASKS[mask](value, masks[mask]);
		}
	}
	return value;
}

const invalidDefault = () => {
	console.log('Invalid Data--> Please check you form');
};

const validDefault = formData => {
	console.log('Form Valid ----------->');
	console.table(formData);
};

export default function useForm() {
	const fieldsRef = useRef({});
	const valuesRef = useRef({});
	const touchedRef = useRef({});
	const errorsRef = useRef({});
	const validRef = useRef({});
	const submitRef = useRef({
		isSubmitting: false,
		isSubmited: false,
		submitCount: 0
	});

	useEffect(() => {
		return () => {
			fieldsRef.current = {};
			valuesRef.current = {};
			touchedRef.current = {};
			errorsRef.current = {};
			validRef.current = {};
			submitRef.current = {
				isSubmitting: false,
				isSubmited: false,
				submitCount: 0
			};
		};
	}, []);

	const [, updateFormState] = useState(uuidv4());

	const checkValidity = name => {
		let error = false;

		if (!fieldsRef.current[name]?.disabled) {
			error = validate(fieldsRef.current[name]?.rules, valuesRef.current[name]);
		}

		const { [name]: _, ...errorFields } = errorsRef.current;
		errorsRef.current = { ...errorFields, ...(error ? { [name]: error } : {}) };

		const { [name]: __, ...validFields } = validRef.current;
		validRef.current = {
			...validFields,
			...(!error ? { [name]: !error } : {})
		};
	};

	const setValue = (name, value) => {
		const mask = fieldsRef.current[name]?.mask;
		if (mask) {
			value = revealMask(mask, value);
		}

		const updatedValues = { ...valuesRef.current, [name]: value };
		valuesRef.current = updatedValues;
	};

	const unregister = field => {
		const { [field]: _, ...remainingField } = fieldsRef.current;
		fieldsRef.current = remainingField;

		const { [field]: _omitValue, ...remainingValue } = valuesRef.current;
		valuesRef.current = remainingValue;

		const { [field]: _omitValid, ...remainingValid } = validRef.current;
		validRef.current = remainingValid;

		const { [field]: _omitTouch, ...remainingTouched } = touchedRef.current;
		touchedRef.current = remainingTouched;

		const { [field]: _omitError, ...remainingErrors } = errorsRef.current;
		errorsRef.current = remainingErrors;

		updateFormState(uuidv4());
	};

	const register = newField => {
		// newField.name = newField.name.replaceAll(" ", "");
		newField.name = newField.name.split(' ').join('');
		fieldsRef.current[newField.name] = newField;

		setValue(newField.name, newField.value || '');
		checkValidity(newField.name);

		return (
			<InputFieldRender
				field={newField}
				onChange={onChange}
				value={valuesRef.current[newField.name] || ''}
				unregister={unregister}
			/>
		);
	};

	const onChange = (event, type) => {
		const { name, value } = event;
		
		// if (fieldsRef.current[name]?.disabled) {
		//   return;
		// }
		
		setValue(name, value);
		checkValidity(name);

		if (type === 'blur') {
			touchedRef.current = { ...touchedRef.current, [name]: true };
		}

		updateFormState(uuidv4());
	};

	const handleSubmit = (valid = validDefault, invalid = invalidDefault) => async e => {
		const { submitCount } = submitRef.current;

		submitRef.current = {
			isSubmitting: true,
			isSubmited: true,
			submitCount: submitCount + 1
		};

		updateFormState(uuidv4());

		if (e) {
			e.preventDefault && e.preventDefault();
			e.persist && e.persist();
		}

		if (
			!Object.keys(errorsRef.current).length ||
			(errorsRef.current.ReferenceEmail0 && errorsRef.current.ReferenceEmail1)
		) {
			await valid(valuesRef.current);
		} else {
			await invalid(valuesRef.current);
		}

		submitRef.current = {
			...submitRef.current,
			isSubmitting: false
		};
		if (Object.keys(errorsRef.current).length > 0) {
			document.getElementsByName(Object.keys(errorsRef.current)[0])[0].focus();
		}

		updateFormState(uuidv4());
	};

	return {
		register,
		handleSubmit,
		formState: {
			touched: touchedRef.current,
			error: errorsRef.current,
			submit: submitRef.current,
			valid: validRef.current,
			values: valuesRef.current
		}
	};
}

const Select = styled.select`
	height: 50px;
	padding: 10px;
	width: 100%;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
`;

// function patternSynthesize(value, pattern, name) {
//   console.log(value, pattern, name);
//   if (pattern) {
//     return "***";
//   }
//   return value;
// }

function InputFieldRender({ field, onChange, value, unregister }) {
	const { type = 'text', rules } = field;

	useEffect(() => {
		return () => {
			unregister(field.name);
		};
	}, []);

	useEffect(() => {
		onChange({ name: field.name, value: value || '' });
	}, [value]);

	const fieldProps = {
		name: field.name,
		onChange: event => {
			const { name, value } = event.target;
			onChange({ name, value });
		},
		onBlur: event => {
			const { name, value } = event.target;
			onChange({ name, value }, 'blur');
		},
		onKeyDown: event => {
			const keyCode = event.keyCode;
			if(keyCode === 69 && field.type === 'number') {
			event.preventDefault();
			}
		},
		value: value || '',
		placeholder: field.placeholder || '',
		disabled: field.disabled,
		className: field.className,
		style: field.style
	};

	if (field.disabled && field.pattern) {
		return <DisabledInput {...{ ...field, ...fieldProps }} />;
	}

	switch (type) {
		case 'search': {
			return (
				<SearchSelect
					name={field.name}
					placeholder={field.placeholder || ''}
					onSelectOptionCallback={onChange}
					onBlurCallback={onChange}
					fetchOptionsFunc={field.fetchOptionsFunc}
					searchOptionCallback={field.searchOptionCallback}
					searchKeyAsValue={field.searchKeyAsValue}
					disabled={field.disabled}
					rules={field.rules}
				/>
			);
		}

		case 'select': {
			return <SelectField {...{ ...field, ...fieldProps }} />;
		}

		case 'radio': {
			return field.options.map(el => (
				<section className='flex items-center gap-x-4 w-full py-4'>
					<input {...{ ...field, ...fieldProps }} type='radio' name={field.name} value={el.value} />
					<section className='flex justify-evenly w-full gap-x-4'>
						<label className='p-2 border rounded-md w-full flex items-center'>
							{el.name.split('-')[0]}
						</label>
						{el.accNum && (
							<label className='p-2 border rounded-md w-full'>
								Account Number: <br />
								{'*'.repeat(el.accNum.length - 4)}
								{el.accNum.substring(el.accNum.length - 4)}
							</label>
						)}
						<label className='p-2 border rounded-md w-full'>
							{/* {el.accNum && `Account Number: ${el.accNum}`}
              <br /> */}
							Customer Id:
							<br />
							{'*'.repeat(el.name.split('-')[1].length - 4)}
							{el.name.split('-')[1].substring(el.name.split('-')[1].length - 4)}
						</label>
					</section>
				</section>
			));
		}

		case 'pincode': {
			return <Pincode {...{ ...field, ...fieldProps }} />;
		}
		case 'banklist': {
			return <BankList field={{ ...field, ...fieldProps }} onSelectOptionCallback={onChange} />;
		}

		case 'date': {
			return <DateField {...{ ...field, ...fieldProps }} />;
		}
		default: {
			return (
				<InputField
					type={type}
					{...{ ...field, ...fieldProps }}
					// value={patternSynthesize(fieldProps.value, field.pattern, field.name)}
				/>
			);
		}
	}
}
