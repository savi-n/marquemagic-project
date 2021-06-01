export default function userType(userType, Componet) {
  const AlteredComponent = (props) => (
    <Componet userType={userType} {...props} />
  );
  return AlteredComponent;
}
