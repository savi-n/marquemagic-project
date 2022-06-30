// This is used in 'src/pages/product/ProductRoutes' and
// 'src/pages/product/Router'

export default function userType(userType, Component) {
	const AlteredComponent = props => (
		<Component userType={userType} {...props} />
	);
	return AlteredComponent;
}
