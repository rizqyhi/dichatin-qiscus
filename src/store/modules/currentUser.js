const getters = {
  getUser(state) {
    return state.user;
  },
};

const actions = {
  setUser({ commit }, user) {
    commit('SET_USER', user);
  },
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
};

const state = {
  user: {},
};

export default {
  state,
  getters,
  actions,
  mutations,
};
