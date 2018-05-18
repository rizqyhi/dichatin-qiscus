import Vue from 'vue';
import Vuex from 'vuex';
import notifications from './modules/notifications';
import currentUser from './modules/currentUser';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    currentUser,
    notifications,
  },
  debug: process.env.NODE_ENV !== 'production',
});
