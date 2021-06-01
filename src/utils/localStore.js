export function localStore(data) {
  localStorage.setItem("cub_details_dev", JSON.stringify(data));
}

export function localStoreUserId(data) {
  localStorage.setItem("cub_user_id_dev", JSON.stringify(data));
}

export function getStore() {
  return {
    ...JSON.parse(localStorage.getItem("cub_details_dev")),
    userId: JSON.parse(localStorage.getItem("cub_user_id_dev")),
  };
}
