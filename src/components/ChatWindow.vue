<template lang="pug">
  div.qcw-chat-wrapper

    svg-icon

    image-modal(:comment="imageModalContent"
      :closeBtnHandler="closeImageModal"
      v-if="imageModalIsActive")

    comment-reply-preview(v-if="repliedComment"
      :comment="repliedComment"
      :closeReplyHandler="closeReply")

    upload-info(v-if="uploadedFiles.length > 0"
      :files="uploadedFiles")

    chat-header(v-if="core.selected && core.UI.config.showHeader"
      @toggle-window="() => toggleWindowStatus()"
      @header-click="() => headerClickedHandler()")

    file-drag-drop(
      :core="core"
      :dragging="dragging"
      @onDragging="onDragging")

    comment-list(:core="core" 
      :on-click-image="openImageModal"
      :repliedComment="repliedComment"
      :replyHandler="setReply" 
      :onupdate="scrollToBottom"
      @onDragging="onDragging")

    comment-form(:core="core"
      v-if="core.UI.config.showCommentForm"
      :repliedComment="repliedComment"
      :closeReplyHandler="closeReply")
</template>

<script>
import SvgIcon from './SVGIcon';
import Icon from './Icon';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import CommentReplyPreview from './CommentReplyPreview';
import { scrollIntoLastElement } from '../lib/utils';
import ImageModal from './ImageModal';
import UploadInfo from './UploadInfo';
import ChatHeader from './ChatHeader';
import FileDragDrop from './FileDragDrop';

export default {
  name: 'ChatWindow',
  props: ['core', 'toggleWindowStatus'],
  components: {
    CommentList,
    SvgIcon,
    Icon,
    CommentForm,
    CommentReplyPreview,
    ImageModal,
    UploadInfo,
    ChatHeader,
    FileDragDrop,
  },
  data() {
    return {
      repliedComment: null,
      imageModalContent: null,
      imageModalIsActive: false,
      dragging: false,
    };
  },
  computed: {
    showIsTypingStatus() {
      const self = this;
      if (this.core.isTypingStatus) {
        window.setTimeout(() => {
          self.core.isTypingStatus = '';
        }, 3000);
        return true;
      }
      return false;
    },
    uploadedFiles() {
      if (!this.core.selected) return [];
      return this.core.uploadedFiles
        .filter(f => f.roomId === this.core.selected.id);
    },
    myReactiveColor() {
      if (this.core.isTypingStatus) {
        return this.core.UI.colors.statusTypingColor;
      } else if (this.core.chatmateStatus === 'Online' && this.core.selected.room_type !== 'group') {
        return this.core.UI.colors.statusOnlineColor;
      }
      return this.core.UI.colors.statusOfflineColor;
    },
    participants() {
      const limit = 3;
      const overflowCount = this.core.selected.participants.length - limit;
      const participants = this.core.selected.participants
          .slice(0, limit)
          .map(item => item.username.split(' ')[0]);
      if (this.core.selected.participants.length <= limit) return participants.join(', ');
      return participants.concat(`and ${overflowCount} others.`)
            .join(', ');
    },
  },
  methods: {
    headerClickedHandler() {
      this.core.options.headerClickedCallback();
    },
    openImageModal(comment) {
      this.imageModalContent = comment;
      this.imageModalIsActive = true;
    },
    closeImageModal() {
      this.imageModalIsActive = false;
      this.imageModalContent = null;
    },
    setReply(comment) {
      this.closeReply();
      this.repliedComment = comment;
      // focus the textarea of commentform
      const element = document.querySelector('.qcw-comment-form textarea');
      if (element) element.focus();
    },
    closeReply() {
      this.repliedComment = null;
    },
    scrollToBottom() {
      scrollIntoLastElement(this.core);
    },
    onDragging(status) {
      this.dragging = status;
    },
  },
};
</script>

<style lang="stylus">
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600')
  @import '../assets/stylus/_variables.styl'

  .qcw-chat-wrapper
    width 360px
    height 0
    display flex
    flex-direction column
    box-shadow 0 7px 16px rgba(46,46,46,.15)
    border-radius 19px
    overflow hidden
    position absolute
    transition all .15s ease-in-out
    bottom 64px
    background-color $darkWhite
    .qcw-container.qcw-container--open &
      height 480px

      @media screen and (max-width: 600px)
        right 0
        bottom 0
        width 100vw
        height 100vh
        z-index 1

  .qcw-window-toggle-btn
    cursor pointer
    flex: 0 0 32px;
    align-items: center;
    justify-content: flex-end;
    display: flex;

  .qcw-header
    flex 0 0 73px
    background $white
    display flex
    align-items center
    padding 13px 16px
    border-bottom 0.5px solid $lightGrey
    .qcw-header-avatar
      flex 0 0 48px
    .qcw-header-avatar img
      width 48px
      height 48px
      border-radius 50%
      margin-top 6px
    .qcw-header-info
      flex 1
      color $darkGrey
      margin-left 16px
      .qcw-user-display-name
        font-size 15px
        font-weight 600
      .qcw-user-status
        font-size 13px
        white-space: nowrap;
        overflow: hidden;

  .qcw-comments
    flex 1
    overflow hidden
    overflow-y auto
    position relative

  .qcw-comment-form
    flex 0 0 64px
    background #FFF
    border-top 0.5px solid $lightGrey

  .qcw-avatar--hide
    visibility hidden

  .reply-wrapper
    position relative
    padding 4px 8px 4px 12px
    background-color $darkWhite
    margin-bottom 8px
    border-radius 2px
    &.reply-wrapper--me
      background-color $darkerWhite;
    .reply-sender
      font-size 13px
      font-weight 600
      color $darkGrey
    .qcw-comment__content
      font-size 13px
      color $mediumGrey

  .reply-wrapper:before
    content ""
    position: absolute
    left 0px
    top 0px
    width 4px
    height calc(100% - 0px)
    background $green
    border-radius 2px 0 0 2px

  .reply-wrapper.reply-wrapper--preview
    margin-bottom 0
    order 1
    width 100%
    background-color $white
    padding 8px 8px 8px 12px
    animation fadeInUp 0.3s ease-out
    box-shadow 0 -8px 16px rgba(199,199,199,0.2)
    // z-index 1
    &:before
      border-radius 0

  .reply-close-btn
    position absolute
    right 8px
    top 8px
    font-size 10px
    cursor pointer
    svg.qc-icon
      height 12px
      width 12px
</style>


