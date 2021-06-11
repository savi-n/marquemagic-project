import styled from "styled-components";

const Wrapper = styled.div`
  height: 170px;
  overflow: hidden;
  margin: 20px;
`;

const Pie = styled.div`
  --angle: ${({ level }) => (level ? `${level * 45}deg` : `45deg`)};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 300px;
  background: conic-gradient(
    from -90deg,
    #ec0080 0deg var(--angle),
    #455c64 var(--angle) 180deg,
    white 180deg
  );
  background-position: center;
  border-radius: 50%;
  position: relative;
  transition: 0.5ms;
`;

const InnerCircle = styled.div`
  width: 125px;
  height: 125px;
  background: white;
  z-index: 2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Stick = styled.div`
  position: absolute;
  height: 100%;
  width: 3px;
  background: white;
  transform: ${({ deg }) => `rotate(${deg})`};
  z-index: 0;
`;

const Pin = styled.div`
  width: 35px;
  height: 35px;
  border: 3px solid #455c64;
  border-radius: 50%;
  z-index: 22;
  background: white;
`;

const Arrow = styled.div`
  position: absolute;
  bottom: 63px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 100px solid #455c64;
  transform-origin: bottom;
  transform: rotate(-52deg);
`;

export default function GuageMeter() {
  return (
    <>
      <Wrapper>
        <Pie level="1">
          <Stick deg="-45deg" />
          <Stick />
          <Stick deg="45deg" />
          <InnerCircle>
            <Arrow />
            <Pin />
          </InnerCircle>
        </Pie>
      </Wrapper>
    </>
  );
}
