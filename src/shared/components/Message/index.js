import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function Message(props) {
	const { type, message, invalid } = props;
	return <>{message && invalid && <span className='text-red-500 text-sm pb-4 fixed top-16'>{message}</span>}</>;
}
