const formaterHOF = (formData, fields, callback) => {
  let data = {};

  for (let { name, type } of fields) {
    data = { ...data, ...callback(name, formData, type) };
  }

  return data;
};

export const formatEmiData = (formData, fields) => {
  return formaterHOF(formData, fields, (name, formData) => ({
    [name]: formData[name],
    // [`${name}_bank`]: formData[`${name}_bank`],
  }));
};

export const formatLoanData = (formData, fields) => {
  return formaterHOF(formData, fields, (name, formData, type) => ({
    [name]:
      type === "search"
        ? formData[name].value || formData[name]
        : formData[name],
  }));
};
