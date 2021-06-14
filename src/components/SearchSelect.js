import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import useClickOutside from "../hooks/useOutsideClick";
import debounceFunction from "../utils/debounce";

const Wrapper = styled.div`
  width: 100%;
  position: relative;
`;

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
  z-index: 9;
  max-height: 160px;
  overflow: auto;
  box-shadow: 0 4px 8px 0 rgb(0 0 0 / 20%);
  margin: 3px 0;
  border: 1px solid rgb(0 0 0 / 20%);
`;

const Option = styled.button`
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
`;

export default function SearchSelect({
  name,
  options = [],
  placeholder,
  searchable,
  fetchOptionsFunc,
  onSelectOptionCallback,
  searchOptionCallback,
  onBlurCallback,
}) {
  const [optionShow, setOptionShow] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectOptions, setSelectOptions] = useState(options);

  const compRef = useRef("");

  useClickOutside(compRef, () => {
    if (optionShow) {
      setOptionShow(false);
    }
  });

  useEffect(() => {
    async function fetchOption() {
      setFetching(true);
      const options = await fetchOptionsFunc();
      setSelectOptions(options);
      setFetching(false);
    }
    if (
      fetchOptionsFunc &&
      typeof fetchOptionsFunc === "function" &&
      !selectOptions.length
    ) {
      fetchOption();
    }
  }, [fetchOptionsFunc]);

  const onOptionSelect = (e, option) => {
    e.stopPropagation();
    setSelectedOption(option);
    if (
      onSelectOptionCallback &&
      typeof onSelectOptionCallback === "function"
    ) {
      onSelectOptionCallback({ name, value: option.value });
    }
    setOptionShow(false);
  };

  const onBlurSearchBox = (event) => {
    if (onBlurCallback && typeof onBlurCallback === "function") {
      onBlurCallback({ name, value: selectedOption?.value }, "blur");
    }
  };

  const onSearchChange = async (event) => {
    const { value } = event.target;
    setSearchKey(value);

    if (searchOptionCallback && typeof searchOptionCallback === "function") {
      setFetching(true);
      debounceFunction(async () => {
        const searchOptions = await searchOptionCallback({
          name: value,
          type: "2 wheeler",
        });
        setSelectOptions(
          searchOptions.map((opt) => ({ name: opt, value: opt }))
        );
        setFetching(false);
      }, 1000);
    }
  };

  const filterdOptions = selectOptions.filter(
    ({ name, value }) =>
      name.toLowerCase().includes(searchKey) ||
      value.toLowerCase().includes(searchKey)
  );

  return (
    <>
      <Wrapper ref={compRef}>
        {selectedOption && (
          <Label focus={optionShow} htmlFor={name}>
            {selectedOption.name}
          </Label>
        )}
        {searchable ? (
          <Input
            id={name}
            name={name}
            type="text"
            onFocus={() => setOptionShow(true)}
            onBlur={onBlurSearchBox}
            placeholder={placeholder || "Search"}
            onChange={onSearchChange}
          />
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
              <Option onClick={(e) => e.preventDefault()} disabled>
                Please wait...
              </Option>
            )}
            {filterdOptions.map((option) => (
              <Option
                key={option.value}
                name={name}
                value={option.value}
                onClick={(e) => onOptionSelect(e, option)}
                selected={option.value === selectedOption?.value}
              >
                {option.name}
              </Option>
            ))}
            {!fetching && !filterdOptions.length && (
              <Option onClick={(e) => e.preventDefault()} disabled>
                Options Not Found
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
