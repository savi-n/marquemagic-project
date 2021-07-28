import styled from "styled-components";
import { string } from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";

const Div = styled.div`
  margin-left: auto;
`;

const Logo = styled.img`
  width: 200px;
  height: calc(100% - 40px);
  object-fit: scale-down;
  object-position: left;
`;

export default function Header({ logo, openAccount, openAccountLink }) {
  return (
    <>
      <a href="/">
        <Logo src={logo} alt="logo" />
      </a>
      {openAccount && (
        <div className="ml-auto">
          <Button onClick={() => window.open(openAccountLink, "_blank")}>
            <span className="px-4">Open Account</span>
            <FontAwesomeIcon icon={faChevronRight} size="1x" />
          </Button>
        </div>
      )}
    </>
  );
}

Header.propTypes = {
  logo: string.isRequired,
};
