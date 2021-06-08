export default function userType(userType, Component) {
  const AlteredComponent = (props) => (
    <Component userType={userType} {...props} />
  );
  return AlteredComponent;
}
