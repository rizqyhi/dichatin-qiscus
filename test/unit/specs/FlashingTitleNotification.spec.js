import { shallow, createLocalVue } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import Vuex from 'vuex';
import QiscusSDK from 'qiscus-sdk-core';
import notificationsModule from '@/store/modules/notifications';
import currentUserModule from '@/store/modules/currentUser';
import App from '@/App';

const localVue = createLocalVue();
localVue.use(Vuex);

const mocks = {
  $core: new QiscusSDK(),
};

describe('Flashing tab title notification', () => {
  let clock;
  let wrapper;
  let store;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    store = new Vuex.Store({
      modules: {
        notifications: cloneDeep(notificationsModule),
        currentUser: currentUserModule,
      },
    });

    store.dispatch('setUser', { id: 1 });
  });

  afterEach(() => {
    clock.restore();
  });

  context('When user is currently in Dicoding tab', () => {
    it('should not see Dicoding tab title is flashing', () => {
      document.title = 'Dicoding';
      document.hasFocus = () => true;

      wrapper = shallow(App, { localVue, store, mocks, attachToDocument: true });
      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' });

      expect(document.title).to.be.equal('Dicoding');
      clock.tick(1000);
      expect(document.title).to.be.equal('Dicoding');
    });
  });

  context('When user is currently not in Dicoding tab', () => {
    it('should see Dicoding tab title is flashing new message notification', () => {
      document.title = 'Dicoding';
      document.hasFocus = () => false;

      wrapper = shallow(App, { localVue, store, mocks, attachToDocument: true });
      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' });

      expect(document.title).to.be.equal('Dicoding');
      clock.tick(1000);
      expect(document.title).to.be.equal('1 Pesan Baru');
      clock.tick(1000);
      expect(document.title).to.be.equal('Dicoding');
    });
  });

  context('When user back to Dicoding tab', () => {
    it('Qiscus App should call method to stop flashing title', () => {
      document.title = 'Dicoding';
      document.hasFocus = () => false;

      wrapper = shallow(App, { localVue, store, mocks, attachToDocument: true });
      const spy = sinon.spy();
      wrapper.setMethods({ stopFlashTitleNotification: spy });
      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' });

      const focusEvent = new Event('focus');
      window.dispatchEvent(focusEvent);

      sinon.assert.called(spy);
    });

    it('Qiscus App should stop flashing title', () => {
      document.title = 'Dicoding';
      document.hasFocus = () => false;

      wrapper = shallow(App, { localVue, store, mocks, attachToDocument: true });
      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' });

      const focusEvent = new Event('focus');
      window.dispatchEvent(focusEvent);

      expect(document.title).to.be.equal('Dicoding');
      clock.tick(1000);
      expect(document.title).to.be.equal('Dicoding');
    });

    context('When chat window is opened', () => {
      it('Qiscus App should dispatch reset notification count action', () => {
        document.hasFocus = () => false;

        wrapper = shallow(App, { localVue, store, mocks, attachToDocument: true });
        const spy = sinon.spy(wrapper.vm.$store, 'dispatch');
        const focusEvent = new Event('focus');

        wrapper.setData({ chatWindowStatus: true });
        store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' });
        window.dispatchEvent(focusEvent);

        sinon.assert.calledWith(spy, 'resetNotificationCount');
      });
    });
  });
});
