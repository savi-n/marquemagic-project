let timer;
const debounceFunction = function(callback, delay) {
  clearTimeout(timer);
  timer = setTimeout(callback, delay);
};

export default debounceFunction;
