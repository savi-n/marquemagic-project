/* This searchSelect is a type of input box where on entering some data
you will see a list that matches the entered data. */

import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import useClickOutside from 'hooks/useOutsideClick';
import debounceFunction from 'utils/debounce';
import { useSelector } from 'react-redux';
// import { style } from 'dom-helpers';

const Wrapper = styled.div`
	width: 100%;
	position: relative;
`;
// const ClearIfsc = styled.button`
// 	background: red;
// 	color: white;
// 	width: 100px;
// 	height: auto;
// 	border-radius: 10px;
// 	border: solid 1px red;
// `;
const Input = styled.input`
	height: 50px;
	padding: 10px;
	width: 100%;
	border: 1px solid rgba(0, 0, 0, 0.2);
	border-radius: 6px;
`;

const Options = styled.div`
	position: absolute;
	top: 100%;
	background: white;
	right: 0;
	left: 0;
	z-index: 999;
	max-height: 160px;
	overflow: auto;
	box-shadow: 0 4px 8px 0 rgb(0 0 0 / 20%);
	margin: 3px 0;
	border: 1px solid rgb(0 0 0 / 20%);
`;

const Option = styled.div`
	border: none;
	border-bottom: 2px solid #dddcdc;
	padding: 10px;
	justify-content: flex-start;
	font-size: 13px;
	font-weight: 500;
	text-transform: capitalize;
	color: #595959;
	width: 100%;
	text-align: left;
	outline: none;
	${({ selected }) =>
		selected &&
		`
      background:green;
      color:white;
    `}

	${({ disabled }) =>
		disabled &&
		`
      background:grey;
      color:white;
    `}
  &:hover {
		background: blue;
		color: white;
	}
`;

const Label = styled.label`
	position: absolute;
	font-size: 14px;
	background: white;
	padding: 0 5px;
	left: 5px;
	display: flex;
	align-items: center;
	transition: 0.2s;
	cursor: pointer;
	z-index: 99;
	${({ focus }) =>
		focus
			? `
      font-weight: 500;
      left: 5px;
      transform: translateY(-50%);

    `
			: `
      top: 5px;
      right: 5px;
      bottom: 5px;
    `}
	${({ disabled }) =>
		disabled &&
		`
		color: grey;
    background: #fafafa;
		cursor: not-allowed;
  `}
`;

const Div = styled.div`
	position: relative;
`;

const Asteris = styled.span`
	color: red;
`;

const PlaceHolder = styled.label`
	position: absolute;
	z-index: 9;
	display: flex;
	align-items: center;
	background: white;
	overflow: hidden;
	top: 3%;
	left: 1%;
	height: 90%;
	width: 98%;
	color: lightgray;
	padding: 0 10px;
`;

export default function SearchSelect(props) {
	const {
		name,
		options = [],
		placeholder,
		searchable,
		fetchOptionsFunc,
		onSelectOptionCallback,
		searchOptionCallback,
		onBlurCallback,
		// searchKeyAsValue,
		rules,
		disabled,
		field,
		defaultValue = '',
		customLabel = '',
		errorMessage,
		// onIfscChange,
	} = props;
	const [optionShow, setOptionShow] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [searchKey, setSearchKey] = useState('');
	const [selectedOption, setSelectedOption] = useState('');
	const [selectOptions, setSelectOptions] = useState(options);
	const [focus, setFocus] = useState(false);
	const compRef = useRef('');
	// const disable3CharacterSearch = true;
	const disable3CharacterSearch = !!field?.disable_3_character_search;

	const { ifscList } = useSelector(state => state.app);
	useClickOutside(compRef, () => {
		if (optionShow) {
			setOptionShow(false);
		}
	});
	useEffect(() => {
		if (
			!!selectedOption &&
			!!field?.name?.includes('ifsc') &&
			!ifscList?.includes(selectedOption)
		) {
			setSelectedOption('');
		}
		// eslint-disable-next-line
	}, [ifscList]);

	useEffect(() => {
		// if(`${field?.value}`==="undefined"){
		// 	setSelectedOption(field?.value);
		// }
		if (field?.value?.length > 0) {
			onOptionSelect(null, {
				name: field.placeholder,
				value: field.value,
			});
		}
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (defaultValue && options?.length > 0) {
			const defaultSelected = options.filter(
				o => `${o.value}` === `${defaultValue}`
			)?.[0];
			// console.log('defaultSelected-', defaultSelected);
			defaultSelected && onOptionSelect(null, defaultSelected);
		}
		// eslint-disable-next-line
	}, [defaultValue, options?.length]);

	useEffect(() => {
		if (options?.length) setSelectOptions(options);
	}, [options]);

	useEffect(() => {
		async function fetchOption() {
			setFetching(true);
			const options = await fetchOptionsFunc();
			setSelectOptions(options);
			setFetching(false);
		}
		if (
			fetchOptionsFunc &&
			typeof fetchOptionsFunc === 'function' &&
			!selectOptions.length &&
			!fetching
		) {
			fetchOption();
		}
		// eslint-disable-next-line
	}, [fetchOptionsFunc]);

	const onOptionSelect = (e, option) => {
		e != null && e.stopPropagation();

		setSelectedOption(option);
		if (
			onSelectOptionCallback &&
			typeof onSelectOptionCallback === 'function'
		) {
			onSelectOptionCallback({
				name,
				value: option,
			});
			// value: option.value
		}
		// setOptionShow(true);
		setSearchKey('');
	};

	const onBlurSearchBox = event => {
		if (onBlurCallback && typeof onBlurCallback === 'function') {
			onBlurCallback(
				{
					name,
					value: selectedOption?.value,
				},
				'blur'
			);
		}
		setFocus(false);
		setOptionShow(false);
		// if (!selectOptions.length && searchKeyAsValue && searchKey) {
		//   onBlurCallback({ name, searchKey }, "blur");
		//   setSelectedOption({ name: searchKey, value: searchKey });
		// }
		// setSearchKey("");
	};

	const onSearchChange = async event => {
		const { value } = event.target;
		if (field.name.includes('ifsc')) {
			if (value.length > 11) return;
			// onIfscChange(value);
		}
		if (field.name.includes('ifsc')) {
			// length of ifsc is always 11
			if (value.length === 11) {
				onOptionSelect(event, value);
			}
		}
		setSearchKey(value.toUpperCase());
		if (searchOptionCallback && typeof searchOptionCallback === 'function') {
			let options = [
				{
					name: value,
					value: value,
				},
			];
			if (!value.trim()) {
				options = [];
			}

			setSelectOptions(options);

			setFetching(true);
			debounceFunction(async () => {
				if (!value) {
					setFetching(false);
					return;
				}
				let searchOptions = await searchOptionCallback({
					name: value,
				});

				searchOptions = searchOptions.map(opt => ({
					name: opt,
					value: opt,
				}));
				if (!searchOptions.length && value.trim()) {
					searchOptions = [
						{
							name: value,
							value: value,
						},
					];
				}
				setSelectOptions(searchOptions);
				setFetching(false);
			}, 1000);
		}
	};

	const filterdOptions = selectOptions?.filter(({ name, value }) => {
		if (disable3CharacterSearch) {
			return (
				name?.toLowerCase().includes(searchKey?.toLowerCase()) ||
				value?.toLowerCase().includes(searchKey?.toLowerCase())
			);
		} else {
			return searchKey.length >= 3
				? name?.toLowerCase().includes(searchKey?.toLowerCase()) ||
						value?.toLowerCase().includes(searchKey?.toLowerCase())
				: false;
		}
	});
	return (
		<>
			<Wrapper ref={compRef}>
				{customLabel ? (
					<Label focus={true}>{customLabel}</Label>
				) : (
					selectedOption &&
					(!!selectedOption?.value && (
						<Label
							focus={optionShow || focus}
							htmlFor={name}
							disabled={disabled}
						>
							{selectedOption.name}
						</Label>
					))
				)}
				{searchable ? (
					<Div>
						<Input
							id={name}
							name={name}
							type='text'
							// onFocus={() => setFocus(true)}
							onFocus={() => {
								setOptionShow(true);
								setFocus(true);
							}}
							onBlur={onBlurSearchBox}
							placeholder={placeholder || 'Search'}
							onChange={onSearchChange}
							value={searchKey}
							autoComplete='off'
							disabled={disabled}
						/>
						{!optionShow && !selectedOption?.name && (
							<PlaceHolder htmlFor={name} disabled={disabled}>
								<span>{placeholder}</span>
								{rules?.required && !disabled && <Asteris>*</Asteris>}
							</PlaceHolder>
						)}
					</Div>
				) : (
					<button
						onFocus={() => setOptionShow(true)}
						onBlur={() => setOptionShow(false)}
					>
						<div>{placeholder}</div>
					</button>
				)}
				{optionShow && (
					<Options>
						{fetching && (
							<Option onClick={e => e.preventDefault()} disabled>
								Please wait...
							</Option>
						)}
						{!!filterdOptions?.length &&
							filterdOptions.map(
								option =>
									!!option?.value &&
									!!option?.name && (
										<Option
											key={option.value}
											name={name}
											value={option.value}
											onMouseDown={e => onOptionSelect(e, option)}
											selected={option.value === selectedOption?.value}
										>
											{option.name}
										</Option>
									)
							)}
						{(!filterdOptions?.length ||
							(filterdOptions?.length === 1 &&
								!filterdOptions?.[0]?.value)) && (
							<Option onClick={e => e.preventDefault()} disabled>
								{disable3CharacterSearch
									? errorMessage
										? errorMessage
										: 'Options Not Found.'
									: searchKey.length < 3
									? 'Please enter atleast 3 character'
									: errorMessage
									? errorMessage
									: 'Options Not Found.'}
								{/* {' '}
								{field.name.includes('ifsc')
									? 'Enter only 11 characters'
									: null} */}
							</Option>
						)}
					</Options>
				)}
			</Wrapper>
		</>
	);
}

SearchSelect.defaultProps = {
	searchable: true,
};

SearchSelect.propTypes = {
	name: PropTypes.string.isRequired,
	searchable: PropTypes.bool,
	placeholder: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		})
	),
	fetchOptionsFunc: PropTypes.func,
	onSelectOptionCallback: PropTypes.func,
	searchOptionCallback: PropTypes.func,
	onBlurCallback: PropTypes.func,
};
