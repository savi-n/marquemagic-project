const name = window.location.hostname;

export function setStore(data, dataFrom) {
  const storeData = {
    ...(JSON.parse(localStorage.getItem(name)) || {}),
    [dataFrom]: data,
  };
  localStorage.setItem(name, JSON.stringify(storeData));
}

export function getStore() {
  return {
    ...(JSON.parse(localStorage.getItem(name)) || {}),
  };
}

export function localStoreUserId(data) {
  localStorage.setItem("cub_user_id_dev", JSON.stringify(data));
}

export function removeStore() {
  localStorage.removeItem(name);
}
