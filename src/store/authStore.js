const _data = {
  role: 'elder',
  phone: '',
  name: '',
  gender: 'female',
  birthDate: '',
};

export const authStore = {
  get: () => ({ ..._data }),
  set: (patch) => Object.assign(_data, patch),
};
