import styled from "styled-components";
import { string, func, object, oneOfType, bool } from "prop-types";

const StyledButton = styled.button`
  color: ${({ theme, fill }) => (fill ? "white" : theme.main_theme_color)};
  border: 2px solid
    ${({ theme, fill }) =>
      fill && (typeof fill === "string" ? fill : theme.main_theme_color)};
  border-radius: ${({ roundCorner }) => (roundCorner ? "40px" : "5px")};
  padding: 10px 20px;
  background: ${({ theme, fill }) =>
    fill && (typeof fill === "string" ? fill : theme.main_theme_color)};
  display: flex;
  align-items: center;
  min-width: ${({ width }) => (width ? width : "200px")};
  justify-content: space-between;
  font-size: 0.9em;
  font-weight: 500;
  text-align: center;
  transition: 0.2s;

  &:hover {
    color: #fff;
    background: ${({ theme, fill }) => fill ?? theme.main_theme_color};
  }
`;

const Div = styled.div`
  text-align: center;
  flex: 1;
`;

export default function Button({
  name,
  onClick,
  children,
  fill,
  style,
  disabled = false,
  width,
  roundCorner = false,
}) {
  return (
    <StyledButton
      onClick={onClick}
      fill={fill}
      disabled={disabled}
      altStyle={style}
      width={width}
      roundCorner={roundCorner}
    >
      {name && <Div>{name}</Div>}
      {children}
    </StyledButton>
  );
}

Button.defaultProps = {
  name: "",
  onClick: () => {},
  children: "",
  fill: null,
  style: {},
};

Button.propTypes = {
  name: string.isRequired,
  onClick: func,
  fill: oneOfType([bool, string]),
  style: object,
};
