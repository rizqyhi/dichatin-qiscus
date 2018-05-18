import { shallow, createLocalVue } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import Vuex from 'vuex';
import QiscusSDK from 'qiscus-sdk-core';
import notificationsModule from '@/store/modules/notifications';
import currentUserModule from '@/store/modules/currentUser';
import App from '@/App';
import QcwTrigger from '@/components/QcwTrigger';
import NotificationBubble from '@/components/NotificationBubble';

const localVue = createLocalVue();
localVue.use(Vuex);

const mocks = {
  $core: new QiscusSDK(),
};

describe('Showing bubble notification', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        notifications: cloneDeep(notificationsModule),
        currentUser: currentUserModule,
      },
    });
  });

  context('When store receive new messages', () => {
    it('should return the number of new messages from customer service', () => {
      store.dispatch('setUser', { id: 1 });
      store.dispatch('addNewMessage', { id: 123, user_id: 1, unix_timestamp: 1526002665, message: 'hai' });
      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' });

      expect(store.getters.getNotificationCount).to.be.equal(1);
    });
  });

  context('When Qiscus App receive new message', () => {
    it('should dispatch new message action if chat window is closed', () => {
      const wrapper = shallow(App, { localVue, store, mocks });

      const spy = sinon.spy(wrapper.vm.$store, 'dispatch');
      const message = { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' };
      wrapper.vm.$core.emit('newmessages', [message]);

      sinon.assert.calledWith(spy, 'addNewMessage', message);
    });

    it('should not dispatch new message action if chat window is opened', () => {
      const wrapper = shallow(App, { localVue, store, mocks });
      const spy = sinon.spy(wrapper.vm.$store, 'dispatch');
      const message = { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' };

      document.hasFocus = () => true;
      wrapper.setData({ chatWindowStatus: true });
      wrapper.vm.$core.emit('newmessages', [message]);

      sinon.assert.neverCalledWith(spy, 'addNewMessage');
    });

    it('should return correct number of new message from store', () => {
      const wrapper = shallow(App, { localVue, store, mocks });

      wrapper.vm.$core.emit('newmessages', [
        { id: 123, user_id: 1, unix_timestamp: 1526002765, message: 'hai juga' },
      ]);
      wrapper.vm.$core.emit('newmessages', [
        { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' },
      ]);
      wrapper.vm.$core.emit('newmessages', [
        { id: 125, user_id: 2, unix_timestamp: 1526002765, message: 'hai' },
      ]);

      expect(store.getters.getNotificationCount).to.be.equal(2);
    });
  });

  context('When notification component receives new message count', () => {
    it('should be shown if there at least 1 message', () => {
      const wrapper = shallow(App, {
        localVue,
        store,
        mocks,
        stubs: { NotificationBubble },
      });

      const message = { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' };
      wrapper.vm.$core.emit('newmessages', [message]);

      expect(wrapper.find(NotificationBubble).text()).to.be.equal('1 pesan baru');
    });

    it('should be hidden if no new message', () => {
      const wrapper = shallow(App, {
        localVue,
        store,
        mocks,
        stubs: { NotificationBubble },
      });

      expect(wrapper.find(NotificationBubble).isVisible()).to.be.false();
    });
  });

  context('When user open the chat window', () => {
    it('should not see notification component', () => {
      const wrapper = shallow(App, {
        localVue,
        store,
        mocks,
      });

      wrapper.setData({ chatWindowStatus: true });

      expect(wrapper.find(NotificationBubble).exists()).to.be.false();
    });

    it('Qiscus App should dispatch reset new message count', () => {
      const wrapper = shallow(App, {
        localVue,
        store,
        mocks,
        attachToDocument: true,
        stubs: { QcwTrigger },
      });

      const message = { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' };
      wrapper.vm.$core.emit('newmessages', [message]);

      const spy = sinon.spy(wrapper.vm.$store, 'dispatch');
      wrapper.find(QcwTrigger).trigger('click');

      sinon.assert.calledWith(spy, 'resetNotificationCount');
    });

    it('Qiscus App should receive zero message count', () => {
      const wrapper = shallow(App, {
        localVue,
        store,
        mocks,
        attachToDocument: true,
        stubs: { QcwTrigger },
      });

      const message = { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' };
      wrapper.vm.$core.emit('newmessages', [message]);

      wrapper.find(QcwTrigger).trigger('click');

      expect(store.getters.getNotificationCount).to.be.equal(0);
    });
  });
});
