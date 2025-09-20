function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

module.exports = {


  friendlyName: 'Check object equal',


  description: '',


  inputs: {

    obj1: {
      type: "ref"
    },
    obj2: {
      type: "ref"
    }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {

    const {obj1, obj2} = inputs;
    if (!obj1 || !obj2) return false;

    return deepEqual(obj1, obj2);

  }


};
