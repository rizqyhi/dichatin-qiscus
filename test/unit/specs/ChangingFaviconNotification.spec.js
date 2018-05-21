describe('Changing favicon notification', () => {
  context('When Notification Favicon compoonent receive props to change current favicon', () => {
    it('should replace current favicon when prop value is true');
    it('should not replace current favicon when prop value is false');
  });

  context('When Qiscus App receive new message from customer service', () => {
    it('should tells Notification Favicon component to change current favicon');
  });

  context('When user is in Dicoding page', () => {
    context('When the chat window is closed', () => {
      it('should see favicon is changed');
    });

    context('When the chat window is opened', () => {
      it('should see the original favicon not changed');
    });
  });

  context('When user is not in Dicoding page', () => {
    context('When the chat window is closed', () => {
      it('should see the favicon is changed');
    });

    context('When the chat window is opened', () => {
      it('should see the original favicon not changed');
    });
  });

  context('When user is back to Dicoding page', () => {
    it('should see the original favicon is restored');
  });
});
