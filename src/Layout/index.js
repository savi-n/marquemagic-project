import './style.scss';

export default function Layout(props) {
	return <section className='p-16 w-full scroll overflow-scroll'>{props.children}</section>;
}
