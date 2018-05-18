const getters = {
  getNotificationCount(state) {
    return state.notificationCount;
  },
};

const actions = {
  addNewMessage({ commit, rootState }, message) {
    if (message.user_id !== rootState.currentUser.user.id) {
      commit('INCREMENT_NOTIFICATION_COUNT');
    }
  },
  resetNotificationCount({ commit }) {
    commit('RESET_NOTIFICATION_COUNT');
  },
};

const mutations = {
  INCREMENT_NOTIFICATION_COUNT(state) {
    state.notificationCount += 1;
  },
  RESET_NOTIFICATION_COUNT(state) {
    state.notificationCount = 0;
  },
};

const state = {
  notificationCount: 0,
};

export default {
  state,
  getters,
  actions,
  mutations,
};
