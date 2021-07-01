import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { shape, string, number } from "prop-types";

const Wrapper = styled.div`
  width: 22%;
  border-radius: 10px;
  /* background: ${({ theme }) => theme.themeColor1}; */
  overflow: hidden;
  box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%);
  margin: 0 calc(12% / 6);
`;

const ImgDiv = styled.div`
  width: 100%;
  height: 200px;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Div = styled.div`
  /* background: ${({ theme }) => theme.themeColor1}; */
  text-align: center;
  padding: 40px;
`;

const Link = styled.a`
  text-decoration: none;
  color: #fff;
  background: ${({ theme }) => theme.main_theme_color};
  padding: 5px 40px;
  display: inline-block;
  border-radius: 20px;
`;

const Description = styled.div`
  color: ${({ theme }) => theme.themeColor2};
  padding: 10px 0;
`;

export default function Card({ product }) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const handleClick = (e, id) => {
    e.preventDefault();
    history.push({
      pathname: `${url}/product/${btoa(id)}`,
      data: id,
    });
  };

  return (
    <Wrapper>
      <ImgDiv>
        <Img src={product.url} alt={product.name} />
      </ImgDiv>
      <Div>
        <Link
          href={`${url}/product/${btoa(product.product_id)}`}
          onClick={(e) => handleClick(e, product.product_id)}
        >
          {product.name}
        </Link>
        <Description>{product.description}</Description>
      </Div>
    </Wrapper>
  );
}

Card.propTypes = {
  product: shape({
    name: string.isRequired,
    url: string.isRequired,
    description: string.isRequired,
    id: number.isRequired,
    product_id: number.isRequired,
  }),
};
