export const maxUploadSize =
	JSON.parse(JSON.parse(sessionStorage.getItem('permission'))?.document_mapping)
		?.document_file_limit &&
	JSON.parse(JSON.parse(sessionStorage.getItem('permission'))?.document_mapping)
		?.document_file_limit.length > 0
		? JSON.parse(
				JSON.parse(sessionStorage.getItem('permission'))?.document_mapping
		  )?.document_file_limit[0]?.max_file_size
		: null;

export const validateFileUpload = files => {
	const respFile = [];
	if (maxUploadSize) {
		if (files && files.length > 0) {
			files.map(selectedFile => {
				if (selectedFile.size > maxUploadSize * 1024 * 1024) {
					// setFile(null);
					respFile.push({
						status: 'fail',
						file: selectedFile,
						error: `File size exceeded ${maxUploadSize}MB. Please select another file`,
					});
				} else {
					respFile.push({ status: 'pass', file: selectedFile });
				}
			});
		}
	} else {
		files.map(selectedFile => {
			respFile.push({ status: 'pass', file: selectedFile });
		});
	}
	return respFile;
};
