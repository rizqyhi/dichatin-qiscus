// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Toasted from 'vue-toasted';
import store from '@/store';
import QiscusWidget from './App';
import QiscusCore from './lib/SDKCore';

Vue.use(Toasted, {
  position: 'bottom-right',
  duration: 3000,
  theme: 'bubble',
});
Vue.config.productionTip = false;
Vue.prototype.$core = QiscusCore;

function renderSDK() {
  /* eslint-disable no-new */
  new Vue({
    store,
    render(h) {
      return h(QiscusWidget);
    },
  }).$mount('#qiscus-widget');
}

export default {
  render: renderSDK,
  core: QiscusCore,
};
