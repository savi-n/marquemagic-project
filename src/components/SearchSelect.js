import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

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

var propTypeCheck = {
  object(item, index) {
    return { ...item, selected: false, id: index + 1 };
  },

  string(item, index) {
    return { title: item, selected: false, id: index + 1 };
  },
};

function setNewArrayOptions(arr, fns) {
  return arr.map((item, index) => {
    return fns[typeof item](item, index);
  });
}

export default function SearchSelect({
  searchable,
  fetchOptionsFunc,
  title,
  output,
}) {
  const [optionShow, setOptionShow] = useState(false);

  const [searchKey, setSearchKey] = useState("");

  const [selectedOption, setSelectedOption] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    async function fetchOption() {
      const options = await fetchOptionsFunc();
      setOptions(options);
    }
    if (fetchOptionsFunc && typeof fetchOptionsFunc === "function") {
      fetchOption();
    }
  }, [fetchOptionsFunc]);

  const onOptionSelect = (option, id) => () => {
    setSelectedOption({ option, id });
  };

  const onSearchChange = (event) => {
    setSearchKey(event.target.value);
  };

  return (
    <>
      <Wrapper>
        {searchable ? (
          <Input
            type="text"
            onFocus={() => setOptionShow(true)}
            onBlur={() => setOptionShow(false)}
            placeholder={title || "Search"}
            onChange={onSearchChange}
          />
        ) : (
          <button
            onFocus={() => setOptionShow(true)}
            onBlur={() => setOptionShow(false)}
          >
            <div>{title}</div>
          </button>
        )}
        {optionShow && (
          <Options>
            {options.map((option, index) => (
              <Option
                key={option.title}
                onClick={onOptionSelect(option, option.id)}
                selected={option.id === selectedOption.id}
              >
                {option.branch}
              </Option>
            ))}
          </Options>
        )}
      </Wrapper>
    </>
  );
}

SearchSelect.defaultProps = {
  searchable: true,
  multiselect: false,
  options: [],
};

SearchSelect.propTypes = {
  searchable: PropTypes.bool,
  multiselect: PropTypes.bool,
  title: PropTypes.string,
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string.isRequired),
    PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
      })
    ),
  ]).isRequired,
  output: PropTypes.func,
};
