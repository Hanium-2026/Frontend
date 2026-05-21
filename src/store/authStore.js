const _data = {
  role: 'elder',
  phone: '',
  name: '',
  gender: 'female',
  birthYear: 1960,
};

export const authStore = {
  get: () => ({ ..._data }),
  set: (patch) => Object.assign(_data, patch),
};
