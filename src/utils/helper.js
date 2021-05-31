export const flower = history => {
	const h = history.location.pathname.split('/');
	const endpointNum = Number(h[h.length - 1]) + 1;
	h[h.length - 1] = endpointNum.toString();
	return h.join('/');
};

const a = 'applicantData';
const l = 'loanData';
var obj = new Map();
obj[a] = {};
obj[l] = {};
var permanent = new Map();
var present = new Map();
obj[a]['address'] = [];

export const handleChange = (e, item, props) => {
	const n = JSON.parse(localStorage.getItem('applicantData'));
	if (n) {
		obj = { ...n };
	}

	if (n && n.applicantData && n.applicantData.address) {
		if (n.applicantData.address[0]) permanent = { ...n.applicantData.address[0] };
		if (n.applicantData.address[1]) present = { ...n.applicantData.address[0] };
	}

	const { data } = props;
	var name;
	var value;
	name = item.key;
	value = e.target.value;
	if (data.label === 'Loan Details') {
		obj[l][name] = value;
	} else {
		if (props.head === 'Permanent Address') {
			permanent['addressType'] = 'permanent';
			permanent[name] = value;
			obj[a]['address'][0] = permanent;
			localStorage.setItem('applicantData', JSON.stringify(obj));
			return;
		} else if (props.head === 'Present Address') {
			present['addressType'] = 'present';
			present[name] = value;
			console.log(present);
			obj[a]['address'][1] = present;
			localStorage.setItem('applicantData', JSON.stringify(obj));
			return;
		}
		obj[a][name] = value;
	}
	localStorage.setItem('applicantData', JSON.stringify(obj));
};

const sub = 'applicantData';
var jsObj = new Map();
jsObj[sub] = {};
var per = new Map();
var pre = new Map();
jsObj[sub]['address'] = [];

export const handleSubType = (e, item, props) => {
	const n = JSON.parse(localStorage.getItem('coApplicantData'));
	if (n) {
		jsObj = { ...n };
	}

	if (n && n.applicantData && n.applicantData.address) {
		if (n.applicantData.address[0]) per = { ...n.applicantData.address[0] };
		if (n.applicantData.address[1]) pre = { ...n.applicantData.address[0] };
	}
	var na;
	var val;
	na = item.key;
	val = e.target.value;

	if (props.head === 'Permanent Address') {
		per['addressType'] = 'permanent';
		per[na] = val;
		jsObj[sub]['address'][0] = per;
		localStorage.setItem('coApplicantData', JSON.stringify(jsObj));
		return;
	} else if (props.head === 'Present Address') {
		pre['addressType'] = 'present';
		pre[na] = val;
		jsObj[sub]['address'][1] = pre;
		localStorage.setItem('coApplicantData', JSON.stringify(jsObj));
		return;
	}
	jsObj[sub][na] = val;

	localStorage.setItem('coApplicantData', JSON.stringify(jsObj));
};
