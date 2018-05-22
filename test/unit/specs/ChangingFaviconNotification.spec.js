import { shallow, createLocalVue } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import Vuex from 'vuex';
import QiscusSDK from 'qiscus-sdk-core';
import notificationsModule from '@/store/modules/notifications';
import currentUserModule from '@/store/modules/currentUser';
import App from '@/App';
import QcwTrigger from '@/components/QcwTrigger';
import NotificationFavicon from '@/components/NotificationFavicon';

const localVue = createLocalVue();
localVue.use(Vuex);

const mocks = {
  $core: new QiscusSDK(),
};

describe('Changing favicon notification', () => {
  let store;
  let favicon;

  beforeEach(() => {
    favicon = sinon.stub(document, 'querySelector');
    favicon.withArgs('link[rel="icon"][sizes="32x32"]').returns({ href: 'favicon1.png' });

    store = new Vuex.Store({
      modules: {
        notifications: cloneDeep(notificationsModule),
        currentUser: currentUserModule,
      },
    });

    store.dispatch('setUser', { id: 1 });
  });

  afterEach(() => {
    document.querySelector.restore();
    document.hasFocus = () => true;
  });

  context('When Notification Favicon compoonent receive props to change current favicon', () => {
    it('should replace current favicon when prop value is true', () => {
      const wrapper = shallow(NotificationFavicon);
      wrapper.setProps({ replaceFavicon: true });

      sinon.assert.calledWith(favicon, 'link[rel="icon"][sizes="32x32"]');
      expect(wrapper.vm.getFaviconEl().href).to.not.equal('favicon1.png');
    });

    it('should not replace current favicon when prop value is false', () => {
      const wrapper = shallow(NotificationFavicon);
      wrapper.setProps({ replaceFavicon: false });

      sinon.assert.calledWith(favicon, 'link[rel="icon"][sizes="32x32"]');
      expect(wrapper.vm.getFaviconEl().href).to.be.equal('favicon1.png');
    });
  });

  context('When Qiscus App receive new message from customer service', () => {
    it('should change current state to replace favicon', () => {
      const spy = sinon.spy();
      const wrapper = shallow(App, { localVue, store, mocks, attachToDocument: true });

      wrapper.setMethods({ replaceFaviconNotification: spy });
      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' });

      sinon.assert.calledOnce(spy);
    });

    it('should tells Notification Favicon component to change current favicon', () => {
      const wrapper = shallow(App, { localVue, store, mocks, attachToDocument: true });

      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' });

      expect(wrapper.vm.shouldReplaceFaviconNotification).to.be.true();
    });
  });

  context('When user is in Dicoding page', () => {
    context('When the chat window is closed', () => {
      it('should see favicon is changed', () => {
        const wrapper = shallow(App, {
          localVue,
          store,
          mocks,
        });

        const message = { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' };
        wrapper.vm.$core.emit('newmessages', [message]);

        expect(wrapper.vm.shouldReplaceFaviconNotification).to.be.true();
      });
    });

    context('When the chat window is opened', () => {
      it('should see the original favicon not changed', () => {
        const wrapper = shallow(App, {
          localVue,
          store,
          mocks,
          stubs: { QcwTrigger },
        });

        const message = { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' };
        wrapper.vm.$core.emit('newmessages', [message]);
        wrapper.find(QcwTrigger).trigger('click');

        expect(wrapper.vm.shouldReplaceFaviconNotification).to.be.false();
      });
    });
  });

  context('When user is not in Dicoding page', () => {
    it('should see the favicon is changed', () => {
      document.hasFocus = () => false;

      const wrapper = shallow(App, {
        localVue,
        store,
        mocks,
      });

      const message = { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai' };
      wrapper.vm.$core.emit('newmessages', [message]);

      expect(wrapper.vm.shouldReplaceFaviconNotification).to.be.true();
    });
  });

  context('When user is back to Dicoding page and chat window is opened', () => {
    it('Qiscus App should call method to restore the original favicon', () => {
      document.hasFocus = () => false;

      const wrapper = shallow(App, {
        localVue,
        store,
        mocks,
        stubs: { QcwTrigger },
      });
      const spy = sinon.spy();
      wrapper.setMethods({ restoreFaviconNotification: spy });
      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' });
      wrapper.find(QcwTrigger).trigger('click');

      const focusEvent = new Event('focus');
      window.dispatchEvent(focusEvent);

      sinon.assert.called(spy);
    });

    it('should see the original favicon is restored', () => {
      document.hasFocus = () => false;

      const wrapper = shallow(App, {
        localVue,
        store,
        mocks,
        stubs: { QcwTrigger },
      });

      store.dispatch('addNewMessage', { id: 124, user_id: 2, unix_timestamp: 1526002765, message: 'hai juga' });
      wrapper.find(QcwTrigger).trigger('click');

      const focusEvent = new Event('focus');
      window.dispatchEvent(focusEvent);

      expect(wrapper.vm.shouldReplaceFaviconNotification).to.be.false();
    });
  });
});
