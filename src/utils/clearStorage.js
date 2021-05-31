export const clearLC = () => {
	localStorage.removeItem('addedCoApplicant');
	localStorage.removeItem('coApplicant');
	localStorage.removeItem('co-applicants');
	localStorage.removeItem('gurantor');
	localStorage.removeItem('token');
	localStorage.removeItem('selectedAccount');
	localStorage.removeItem('applicantData');
	localStorage.removeItem('coApplicantData');
};
