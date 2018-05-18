import { shallow, createLocalVue } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import Vuex from 'vuex';
import QiscusSDK from 'qiscus-sdk-core';
import notificationsModule from '@/store/modules/notifications';
import currentUserModule from '@/store/modules/currentUser';
import App from '@/App';
import NotificationSound from '@/components/NotificationSound';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Playing sound notification', () => {
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
    wrapper = shallow(App, {
      localVue,
      store,
      mocks: { $core: new QiscusSDK() },
    });

    store.dispatch('setUser', { id: 1 });
  });

  afterEach(() => {
    clock.restore();
  });

  context('When sound notification component retrive props to play sound', () => {
    it('should play notification sound', () => {
      const componentWrapper = shallow(NotificationSound);

      const spy = sinon.stub(componentWrapper.vm.audio, 'play');
      componentWrapper.setProps({ play: true });

      sinon.assert.called(spy);
    });
  });

  context('When Qiscus App receive new messages from customer service', () => {
    context('When it only receive one message at a time', () => {
      it('should trigger sound notification component to play once', () => {
        store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' });

        expect(wrapper.vm.shouldPlayNotificationSound).to.be.true();
      });
    });

    context('When it receives more than one message in a second', () => {
      it('should trigger sound notification component to play once', () => {
        store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' });
        store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' });

        expect(wrapper.vm.shouldPlayNotificationSound).to.be.true();
        clock.tick(1000);
        expect(wrapper.vm.shouldPlayNotificationSound).to.be.false();
      });
    });
  });
});
