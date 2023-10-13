import { useState, useRef, useEffect, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import SearchSelect from 'components/SearchSelect';
import BankList from 'components/inputs/Individual/BankList';
import IfscList from 'components/inputs/Individual/IfscList';
import Pincode from 'components/inputs/Individual/PinCode';
import DateField from 'components/inputs/DateField';
import InputField from 'components/inputs/InputField';
import InputFieldWithInfo from 'components/inputs/InputFieldWithInfo';
import SelectField from 'components/inputs/SelectField';
import DisabledInput from 'components/inputs/DisabledInput';
import AddressProofRadio from 'components/inputs/AddressProofRadio';
import DisabledTextFieldModal from 'components/inputs/GstinField';
import * as CONST_LOAN_DETAILS from 'components/Sections/LoanDetails/const';
import Button from 'components/Button';
import moment from 'moment';
import { UDYAM_REGEX } from '_config/app.config';
import SearchSelectMainComponent from 'components/inputs/Individual/SearchSelectMainComponent';
import SearchSelectSubComponent from 'components/inputs/Individual/SearchSelectSubComponent';
import CheckBox from 'components/inputs/CheckBox';
import Divider from 'components/Divider';

export const ComboBoxContext = createContext();
function required(value) {
	return typeof value === 'string' ? !value?.trim() : !value;
}

function numberOnly(value) {
	return !Number(value);
}

function pastDatesOnly(value) {
	// console.log(moment().format('YYYY/MM'), '222');
	return !moment().isAfter(value);
}

function ageLimit(value, ageLimit) {
	// console.log(moment().diff(value, 'years', true) > ageLimit)
	return moment().diff(value, 'years', true) < ageLimit;
}

function maxAgeLimit(value, maxAgeLimit) {
	// console.log(moment().diff(value, 'years', true) > ageLimit)
	return moment().diff(value, 'years', true) > maxAgeLimit;
}

function validatePattern(pattern) {
	return function(value, pat) {
		pat = typeof pat === 'boolean' ? pattern : pat;
		const resp = !new RegExp(pat).test(value);
		return resp;
	};
}

function validatePatternNew(inputString, str) {
	const pattern = /^[Ff]\d+$/;
	return !pattern.test(inputString);
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

// TODO: varun make validation key align with new json small letter with underscore
const VALIDATION_RULES = {
	required: {
		func: required,
		message: 'Required Field',
	},
	number: {
		func: numberOnly,
		message: 'Numbers only Allowed',
	},
	email: {
		// eslint-disable-next-line
		// func: validatePattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g),
		func: validatePattern(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/),
		message: 'Invalid Email Address',
	},
	empty_or_email: {
		func: validatePattern(/^$|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/),
		message: 'Invalid Email Address',
	},
	is_udyam: {
		func: validatePattern(UDYAM_REGEX),
		message: 'Please Enter A Valid Udyam Number',
	},
	is_zero_not_allowed_for_first_digit: {
		func: validatePattern(/^[1-9][0-9]*$/),
		message: 'Number cannot start with 0',
	},
	past_dates: {
		func: pastDatesOnly,
		message: 'Enter only dates from the past.',
	},
	age_limit: {
		func: ageLimit,
		message: 'The applicant should be above the age limit',
	},
	max_age_limit: {
		func: maxAgeLimit,
		message: 'The applicant should be below the age limit',
	},
	startWith: {
		func: validatePatternNew,
		message: 'Please enter in correct format',
	},
	ifsc: {
		func: validatePattern(/[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/),
		message: 'Invalid IFSC (ex: SBIN0000304)',
	},
	pattern: {
		func: validatePattern(),
		message: 'Pattern Mismatch',
	},
	pan_number: {
		func: validatePattern(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/),
		message: 'Invalid PAN Number (ex: BDEFG4467C)',
	},
	maxLength: {
		func: limitLength('max'),
		message: 'Exceeds Character Length',
	},
	minLength: {
		func: limitLength('min'),
		message: 'Minimum Character limit',
	},
	length: {
		func: limitLength(),
		message: 'Character Length Mismatch',
	},
	maxValue: {
		func: maxValue,
		message: 'Value exceeds the limit',
	},
	minValue: {
		func: minValue,
		message: 'Minimum limit needed',
	},
	limitMaxValue: {
		func: maxValue,
		message: 'Value exceeds the limit',
	},
	limitMinValue: {
		func: minValue,
		message: 'Minimum limit needed',
	},
	valueMatchWith: {
		func: valueMatchWith,
		message: 'Mismatch',
	},
	subAction: {
		func: (value, params) => {
			return params;
		},
		message: 'Upload agreement is mandatory',
	},
	mobile_number: {
		func: validatePattern(/^[6789]\d{9}$/),
		message: 'Enter valid Phone Number',
	},
};

function validate(rules, value) {
	if (!rules || Object.keys(rules || {}).length === 0) return false;
	// all rules will be applied only if required: true or value exists in the field
	if (rules?.required || value) {
		for (const rule in rules) {
			if (VALIDATION_RULES[rule]?.func(value, rules[rule])) {
				return VALIDATION_RULES[rule].message;
			}
		}
	}
}

const MASKS = {
	number_only: value => `${value}`?.replace(/[^\d]+/g, '') || '',
	character_limit: (value, n) => `${value}`?.substring(0, n) || '',
	alpha_char_only: value => `${value}`?.replace(/[^a-zA-Z .]/g, '') || '',
	alphaNumeric_only: value => `${value}`?.replace(/[^a-zA-Z0-9]+$/i, ''),
	pureAlphaNumeric: value => `${value}`?.replace(/[^a-zA-Z0-9]/, ''),
	mask_values: (value, options) => {
		// console.log('inside mask');
		// start value
		value = value?.toString();
		let startingValuesOfMask = value
			?.slice(0, +options?.characters_not_to_be_masked?.from_starting)
			?.padEnd(
				+value?.length - options?.characters_not_to_be_masked?.from_ending,
				options?.mask_pattern
			);
		// end value
		let endingValuesOfMask = value?.slice(
			+value?.length - +options?.characters_not_to_be_masked?.from_ending
		);
		let maskedValue = startingValuesOfMask + endingValuesOfMask;
		return maskedValue;
	},
};

function revealMask(masks, value) {
	for (const mask in masks) {
		if (masks[mask] && MASKS[mask]) {
			value = MASKS[mask](value, masks[mask]);
		}
	}
	return value;
}

const invalidDefault = () => {
	// console.log('Invalid Data--> Please check you form');
};

const validDefault = formData => {
	// console.log('Form Valid ----------->');
	console.table(formData);
};

export default function useForm() {
	const { app } = useSelector(state => state);
	const fieldsRef = useRef({});
	const valuesRef = useRef({});
	const touchedRef = useRef({});
	const errorsRef = useRef({});
	const validRef = useRef({});
	const submitRef = useRef({
		isSubmitting: false,
		isSubmited: false,
		submitCount: 0,
	});

	const resetForm = () => {
		fieldsRef.current = {};
		valuesRef.current = {};
		touchedRef.current = {};
		errorsRef.current = {};
		validRef.current = {};
		submitRef.current = {
			isSubmitting: false,
			isSubmited: false,
			submitCount: 0,
		};
	};

	useEffect(() => {
		return () => {
			resetForm();
		};
	}, []);

	const [, updateFormState] = useState(uuidv4());

	const checkValidity = name => {
		const { selectedSectionId } = app;
		let error = false;
		if (
			!fieldsRef.current[name]?.disabled ||
			(selectedSectionId && selectedSectionId === 'business_details')
		) {
			error = validate(fieldsRef.current[name]?.rules, valuesRef.current[name]);
		}
		// error = validate(fieldsRef.current[name]?.rules, valuesRef.current[name]);
		const { [name]: _, ...errorFields } = errorsRef.current;
		errorsRef.current = { ...errorFields, ...(error ? { [name]: error } : {}) };

		const { [name]: __, ...validFields } = validRef.current;
		validRef.current = {
			...validFields,
			...(!error ? { [name]: !error } : {}),
		};
	};

	const setError = (name, error) => {
		const newTouchedRef =
			Object.keys(touchedRef.current).length > 0
				? { ...touchedRef.current, [name]: true }
				: { [name]: true };
		touchedRef.current = newTouchedRef;

		const newErrorsValues =
			Object.keys(errorsRef.current).length > 0
				? { ...errorsRef.current, [name]: error }
				: { [name]: error };
		errorsRef.current = newErrorsValues;

		const { [name]: __, ...validFields } = validRef.current;
		validRef.current = {
			...validFields,
			...(!error ? { [name]: !error } : {}),
		};

		updateFormState(uuidv4());
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

	const register = field => {
		const { userDetails, isViewLoan } = app;
		let newField = _.cloneDeep(field);
		// Masking the values for view loan based on the configuration (Masking starts)
		if (
			newField.is_masked &&
			isViewLoan &&
			!newField?.user_types_allowed?.includes(userDetails?.usertype) &&
			!newField?.user_types_allowed?.includes(userDetails?.user_sub_type) &&
			!newField?.user_types_allowed?.includes('*')
		) {
			delete newField?.mask?.mask_values;
			// console.log('deleted mask as there was no usertype or user sub type');
		}
		// new addition
		if (
			newField.is_masked &&
			isViewLoan &&
			(newField?.user_types_allowed?.includes(userDetails?.usertype) ||
				newField?.user_types_allowed?.includes(userDetails?.user_sub_type) ||
				newField?.user_types_allowed?.includes('*'))
		) {
			// console.log('masking happens ' + newField.name);
			if (newField?.is_masked) {
				// console.log('deleted rules and other masks');
				newField.rules = {};
				delete newField.mask.number_only;
				delete newField.mask.character_limit;
				delete newField.mask.alpha_char_only;
				delete newField.mask.alphaNumeric_only;
				delete newField.type;
			}
		}

		if (!isViewLoan && newField?.mask?.mask_values) {
			// console.log(
			// 	'deleted masking as it is not view loan and field has maskvalues',
			// 	{ newField }
			// );
			delete newField?.mask?.mask_values;
		}
		// Masking ends

		// condition to check whether the ifsc field should be validated or not
		// if (newField?.name?.includes('ifsc')) {
		// 	// newField.mask = { character_limit: 11 };
		// 	if (newField?.value?.length === 0) {
		// 		newField.rules = {};
		// 	}
		// }
		// newField.name = newField.name.replaceAll(" ", "");
		newField.name = newField?.name?.split(' ')?.join('');
		fieldsRef.current[(newField?.name)] = newField;
		if (
			newField?.name?.includes('bank_name') ||
			newField?.type?.includes('bank')
		) {
			// new changes by akash cloud stock nov-30
			newField?.value &&
				!valuesRef?.current?.[newField?.name] &&
				setValue(newField?.name, newField?.value || '');
		} else {
			// old
			setValue(newField?.name, newField?.value || '');
		}
		checkValidity(newField?.name);
		return (
			<InputFieldRender
				field={newField}
				onChange={onChange}
				value={valuesRef.current[newField.name] || ''}
				unregister={unregister}
				error={
					(touchedRef?.current?.[newField?.name] &&
						errorsRef?.current?.[newField?.name]) ||
					''
				}
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

	const forceUpdate = () => {
		updateFormState(uuidv4());
	};

	const handleSubmit = (
		valid = validDefault,
		invalid = invalidDefault
	) => async e => {
		// console.log(valid);
		// console.log(invalid);

		const { submitCount } = submitRef.current;

		submitRef.current = {
			isSubmitting: true,
			isSubmited: true,
			submitCount: submitCount + 1,
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
			isSubmitting: false,
		};
		// console.log('-error-ref-', { valuesRef, touchedRef, errorsRef });
		if (Object.keys(errorsRef?.current || {}).length > 0) {
			document
				.getElementsByName(Object.keys(errorsRef?.current || {})?.[0])?.[0]
				?.focus();
		}

		updateFormState(uuidv4());
	};

	const clearError = () => {
		const { submitCount } = submitRef.current;
		submitRef.current = {
			isSubmitting: false,
			isSubmited: false,
			submitCount: submitCount,
		};
		submitRef.current = {
			...submitRef.current,
			isSubmitting: false,
		};
		errorsRef.current = {};
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
			values: valuesRef.current,
		},
		clearErrorFormState: clearError,
		onChangeFormStateField: onChange,
		setErrorFormStateField: setError,
		resetForm: resetForm,
		forceUpdate,
	};
}

// const Select = styled.select`
// 	height: 50px;
// 	padding: 10px;
// 	width: 100%;
// 	border: 1px solid rgba(0, 0, 0, 0.1);
// 	border-radius: 6px;
// `;

// function patternSynthesize(value, pattern, name) {
// console.log(value, pattern, name);
//   if (pattern) {
//     return "***";
//   }
//   return value;
// }

// const Currency = styled.div`
// 	/* position: absolute; */
// 	margin-left: 100%;
// 	padding-left: 10px;
// 	padding-bottom: 15px;
// 	margin-top: -35px;
// 	width: 50px;
// 	font-size: 13px;
// 	font-weight: 500;
// 	display: flex;
// 	align-items: center;
// 	top: 0;
// `;

// const InputFieldWrapper = styled.div`
// 	/* display: flex; */
// 	/* justify-content: space-between; */
// 	div:first-of-type {
// 		width: 100%;
// 	}
// `;

function InputFieldRender({ field, onChange, value, unregister, error }) {
	const { type = 'text' } = field;
	useEffect(() => {
		return () => {
			unregister(field.name);
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		// console.log({ field, value, name: field?.name });
		if (field?.name !== CONST_LOAN_DETAILS.BRANCH_FIELD_NAME) {
			onChange({
				name: field.name,
				value: value || '',
			});
		}
		if (field?.name === 'pan_number') {
			onChange({
				name: field?.name,
				value: value?.trim().toUpperCase() || '',
			});
		}
		// eslint-disable-next-line
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
			if (keyCode === 69 && field.type === 'number') {
				event.preventDefault();
			}
		},
		value: value || '',
		placeholder: field.placeholder || '',
		disabled: field.disabled,
		className: field.className,
		style: field.style,
		error,
	};

	if (field.disabled && field.pattern) {
		return <DisabledInput {...{ ...field, ...fieldProps }} />;
	}

	// if (field.name.includes('ifsc')) {
	// 	field.mask = {};
	// 	field.rules = {};
	// }

	switch (type) {
		case 'search': {
			return (
				<SearchSelect
					name={field.name}
					placeholder={field.placeholder || ''}
					onSelectOptionCallback={
						field?.name !== CONST_LOAN_DETAILS.CONNECTOR_NAME_FIELD_NAME &&
						onChange
					}
					onBlurCallback={onChange}
					fetchOptionsFunc={field.fetchOptionsFunc}
					searchOptionCallback={field.searchOptionCallback}
					searchKeyAsValue={field.searchKeyAsValue}
					disabled={field.disabled}
					rules={field.rules}
					defaultValue={value}
					options={field?.options}
					field={{ ...field, ...fieldProps }}
				/>
			);
		}

		case 'select': {
			return (
				<SelectField
					{...{ ...field, ...fieldProps }}
					style={{
						minWidth: 100,
					}}
				/>
			);
		}

		case 'dropdown': {
			return (
				<SelectField
					{...{ ...field, ...fieldProps }}
					style={{
						minWidth: 100,
					}}
				/>
			);
		}

		case 'address_proof_radio': {
			return <AddressProofRadio {...{ ...field, ...fieldProps }} />;
		}
		case 'radio': {
			return field.options.map(el => (
				<section className='flex items-center gap-x-4 w-full py-4'>
					<input
						{...{ ...field, ...fieldProps }}
						type='radio'
						name={field.name}
						value={el.value}
					/>
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
							{el.name
								.split('-')[1]
								.substring(el.name.split('-')[1].length - 4)}
						</label>
					</section>
				</section>
			));
		}

		case 'pincode': {
			return <Pincode {...{ ...field, ...fieldProps }} />;
		}
		case 'banklist': {
			return (
				<BankList
					field={{ ...field, ...fieldProps }}
					onSelectOptionCallback={onChange}
					value={value}
				/>
			);
		}
		case 'ifsclist': {
			return (
				<IfscList
					field={{ ...field, ...fieldProps }}
					onSelectOptionCallback={onChange}
					value={value}
				/>
			);
		}
		case 'industryType': {
			return (
				<SearchSelectMainComponent
					field={{ ...field, ...fieldProps }}
					onSelectOptionCallback={onChange}
					value={value}
				/>
			);
		}
		case 'subIndustryType': {
			return (
				<SearchSelectSubComponent
					field={{ ...field, ...fieldProps }}
					onSelectOptionCallback={onChange}
					value={value}
				/>
			);
		}
		case 'date': {
			return (
				<DateField
					{...{ ...field, ...fieldProps }}
					max={fieldProps?.max || '9999-12-31'}
				/>
			);
		}
		case 'month': {
			return (
				<DateField
					{...{ ...field, ...fieldProps }}
					max={fieldProps?.max || '9999-12'}
				/>
			);
		}
		case 'disabledtextfieldmodal': {
			return <DisabledTextFieldModal {...{ ...field, ...fieldProps }} />;
		}
		//DisabledTextFieldModal
		case 'button': {
			return (
				<Button
					{...{ ...field, ...fieldProps }}

					// style={{
					// 	Width: '150px',
					// }}
				/>
			);
		}
		case 'input_field_with_info': {
			return (
				<InputFieldWithInfo
					type={type}
					{...{ ...field, ...fieldProps }}

					// value={patternSynthesize(fieldProps.value, field.pattern, field.name)}
				/>
			);
		}
		case 'checkbox': {
			return <CheckBox {...{ ...field, ...fieldProps }} />;
		}
		case 'divider': {
			return <Divider {...{ ...field, ...fieldProps }} />;
		}
		default: {
			return (
				<>
					<InputField
						type={type}
						{...{ ...field, ...fieldProps }}

						// value={patternSynthesize(fieldProps.value, field.pattern, field.name)}
					/>
					{/* {field?.inrupees && (
						<Currency>{field.inrupees ? '(In  ₹ )' : ''}</Currency>
					)} */}
				</>
			);
		}
	}
}
