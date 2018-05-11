<template lang="pug">
  div(:class="{'parent--container':isParent, 'my--container': isMe, 'qcw-group': isGroupRoom, 'contain-date': showDate, 'deleted': isDeleted}")
    div(class="qcw-comment-container" :id="comment.id" :class="commentClass")
      div(v-if="showDate" class="qcw-comment-date" :class="{'extra-margin': addExtraMargin}")
        div {{ dateToday }}
      div(v-if="comment.type == 'system_event'" class="qcw-comment--system-event")
        comment-custom(v-if="core.customTemplate && haveTemplate(comment)" :data="comment")
        div(v-else) {{ comment.message }}
      div(
        class="qcw-comment"
        v-if="comment.type != 'system_event'"
        :class="{ 'comment--me': comment.username_real == userData.email, 'comment--parent': isParent, 'comment--mid': isMid, 'comment--last': isLast }"
      )
        avatar(:src="comment.avatar" :class="{'qcw-avatar--hide': !isParent}")

        div(class="qcw-comment__message"
          :style="{messageStyle:!isCustomBuble}"
          :class="{'extra-margin carousel': comment.type === 'carousel','card':comment.type === 'card','hover-effect':!isDeleted && !isCustomBuble}")

          //- Comment User
          //- span(class="qcw-comment__username" v-if="isParent && isGroupRoom && !isMe") {{comment.username_as}}
          span(class="qcw-comment__username" v-if="isParent && !isMe") {{comment.username_as}}

          //- reply button
          i(@click="replyHandler(comment)" class="reply-btn" :class="{'reply-btn--me': isMe}" v-if="!isDeleted && !isMe")
            icon(name="ic-reply")

          //- more vertical button 
          i(class="qcw-comment__more" @click="menuMoreClicked(comment.id)" v-if="isMe && !isDeleted")
            icon(name="ic-more-horiz")
            
          div(
            :key="`comment_${comment.id}`"
            ref="`more_${comment.id}`"
            class="qcw-comment__more--menu"
            v-if="isMe && !isDeleted && showMenuMore"
            v-click-outside="onClickMenuOutside"
            )
            ul
              li(@click="replyHandler(comment)") Reply
              li(@click="confirmDeleteComment(comment)") Delete
              li(@click="messageInfoHandler(comment)") Message Info

          //- CommentType: "location"
          static-map(:lat="comment.payload.latitude"
            :lng="comment.payload.longitude"
            :name="comment.payload.name"
            :message="comment.message"
            :mapurl="comment.payload.map_url"
            v-if="comment.type == 'location'")

          //- CommentType: "file_attachment"
          file-attachment(v-if="comment.type == 'file_attachment'"
            :comment="comment"
            :on-click-image="onClickImage"
            :callback="onupdate")

          //- CommentType: "CAROUSEL"
          comment-carousel(:cards="comment.payload.cards" :mode="this.core.mode" v-if="comment.type === 'carousel'")

          //- CommentType: "CUSTOM"
          comment-custom(v-if="comment.type === 'custom'" :data="comment")

          //- CommentType: "BUTTON"
          div(v-if="comment.type == 'buttons'" class="button-message")
            div(class="qcw-comment__content" v-html="comment.payload.text || comment.message")
            comment-buttons(:buttons="comment.payload.buttons" :postbackHandler="postbackSubmit")

          //- CommentType: "CARD"
          comment-card(:data="comment.payload" v-if="comment.type==='card'")

          //- CommentType: "CARD"
          div(v-if="comment.type=='button_postback_response'" class="comment-text" @click.self="menuMoreClicked(null)")
            comment-render(:text="comment.message" v-if="!comment.isAttachment(comment.message)")

          //- CommentType: "ACCOUNT_LINKING"
          div(v-if="comment.type == 'account_linking'")
            comment-render(:text="comment.payload.text || message")
            div(class="qcw-comment__buttons")
              div(class="action_buttons")
                button(@click="openAccountBox") {{ comment.payload.params.button_text }} &rang;

          //- CommentType: "TEXT"
          div(class="comment-text" v-if="comment.type == 'text' || comment.type == 'reply'")
            image-loader(v-if="comment.isAttachment(comment.message) && comment.type != 'reply'"
              :comment="comment"
              :message="comment.message"
              :on-click-image="onClickImage"
              :callback="onupdate")

            comment-reply(v-if="comment.type =='reply'"
              :comment="comment"
              :isMe="isMe"
              :clickHandler="gotoComment"
              :onClickImage="onClickImage"
              :callback="onupdate")

            comment-render(:text="comment.message" v-if="!comment.isAttachment(comment.message) && comment.type=='text'")

          span(class="qcw-comment__time qcw-comment__time--children"
            v-if="!isParent"
            :class="{'qcw-comment__time--attachment': comment.isAttachment(comment.message)}") {{comment.time}}

          span(class="qcw-comment__time"
            :class="{'qcw-comment__time--me': isMe}"
            v-if="!isMe"
            :style="messageTimeStyle") {{comment.time}}

          //- State
          div(v-if="isMe")
            div(class="qcw-comment__state qcw-comment__state--sending" v-if="comment.isPending")
              icon(name="ic-load" class="ic-load__state" :fill="messageStatusIconStyle")
            div(class="qcw-comment__state" v-if="!comment.isChannel && comment.isSent && !comment.isDelivered")
              icon(name="ic-check" class="ic-check__state" :fill="messageStatusIconStyle")
            div(@click="resend(comment)" class="qcw-comment__state qcw-comment__state--failed"
              v-if="comment.isFailed" :style="messageFailedIconStyle") !!!
            div(class="qcw-comment__state qcw-comment__state--delivered" v-if="!comment.isChannel && comment.isDelivered && !comment.isRead")
              icon(name="ic-double-check" class="ic-double-check__state" :fill="messageStatusIconStyle")
            div(class="qcw-comment__state qcw-comment__state--read" v-if="!comment.isChannel && comment.isRead")
              icon(name="ic-double-check" class="ic-double-check__state")

    div(class="failed-info" v-if="comment.isFailed"
      :class="{ 'failed--last': isLast }") Message failed to send.
      span(@click="resend(comment)" class="" v-if="comment.isFailed") Resend

</template>

<script>
import QiscusCore from '../lib/SDKCore';
import Avatar from './Avatar';
import Icon from './Icon';
import StaticMap from './StaticMap';
import ImageLoader from './ImageLoader';
import FileAttachment from './FileAttachment';
import CommentRender from './CommentRender';
import CommentReply from './CommentReply';
import CommentCustom from './CommentCustom';
import CommentCarousel from './CommentCarousel';
import CommentCard from './CommentCard';
import CommentButtons from './CommentButtons';
import clickOutside from '../lib/clickOutside';

export default {
  name: 'Comment',
  components: {
    Avatar,
    Icon,
    StaticMap,
    ImageLoader,
    FileAttachment,
    CommentRender,
    CommentReply,
    CommentCustom,
    CommentCarousel,
    CommentCard,
    CommentButtons,
  },
  props: ['comment', 'commentBefore', 'commentAfter', 'userData', 'onClickImage', 'onupdate', 'replyHandler', 'showAvatar', 'currentMenuId'],
  directives: { clickOutside },
  computed: {
    isChannel() {
      return this.comment.isChannel;
    },
    isDeleted() {
      return this.comment.is_deleted === true;
    },
    isCustomBuble() {
      return this.comment.type === 'card' || this.comment.type === 'carousel';
    },
    showDate() {
      return this.commentBefore === null || (this.commentBefore.date !== this.comment.date);
    },
    addExtraMargin() {
      return this.commentBefore !== null
        && this.commentBefore.username_real === this.comment.username_real;
    },
    isParent() {
      return this.commentBefore === null ||
        this.commentBefore.username_real !== this.comment.username_real;
    },
    isGroupRoom() {
      return this.core.selected.room_type === 'group';
    },
    isMid() {
      return this.commentAfter !== null && !this.isParent &&
        this.commentAfter.username_real === this.comment.username_real;
    },
    isLast() {
      return this.commentAfter === null ||
        this.commentAfter.username_real !== this.comment.username_real;
    },
    isMe() { return this.comment.username_real === this.userData.email; },
    showMenuMore() {
      if (!this.currentMenuId) return false;
      return this.comment.id === this.currentMenuId;
    },
  },
  data() {
    return {
      dateToday: new Date(this.comment.date).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }),
      commentClass: {
        [`qcw-comment--${this.comment.type}`]: this.comment.username_real !== this.userData.email,
        [`qcw-comment--${this.comment.type} comment--me`]: this.comment.username_real === this.userData.email,
      },
      messageStyle: {},
      messageStatusIconStyle: { fill: QiscusUI.colors.messageStatusIconColor },
      messageFailedIconStyle: { fill: QiscusUI.colors.messageFailedIconColor },
      messageTimeStyle: { color: QiscusUI.colors.messageTimeColor },
      core: QiscusCore,
    };
  },
  mounted() {
    this.messageStyle = {
      color: (this.isMe)
        ? this.core.UI.colors.bubleRightTextColor
        : this.core.UI.colors.bubleLeftTextColor,
      background: (this.isMe)
        ? this.core.UI.colors.bubleRightColor
        : this.core.UI.colors.bubleLeftColor,
    };
  },
  methods: {
    onClickMenuOutside() {
      if (!this.currentMenuId) return;
      this.menuMoreClicked(null);
    },
    gotoComment() {
      const element = document.getElementById(this.comment.payload.replied_comment_id);
      if (!element) return;
      element.scrollIntoView({ block: 'end',  behaviour: 'smooth' });
    },
    resend(comment) {
      return this.core.resendComment(comment)
        .then(() => this.$toasted.success('Resending comment successful'),
        () => this.$toasted.error('Resending comment failed'));
    },
    confirmDeleteComment(comment) {
      const actions = [];
      if (!comment.isChannel) {
        actions.push({
          text: 'For me',
          onClick: () => this.deleteComment(comment, false)
            .then(() => {
              this.$toasted.success('Message deleted');
            }, (err) => {
              this.$toasted.error(`Failed deleting message: ${err}`);
            }),
        });
      }
      actions.push({
        text: 'For everyone',
        onClick: () => this.deleteComment(comment, true)
          .then(() => {
            this.$toasted.success('Message deleted');
          }, () => {
            this.$toasted.error('Failed deleting message');
          }),
      });
      actions.push({
        text: 'Cancel',
        onClick: (e, toastObject) => toastObject.goAway(0),
      });
      return this.$toasted.show('Are you sure to delete this message?', {
        duration: 5000,
        action: actions,
      });
    },
    deleteComment(comment, isForEveryone) {
      this.$toasted.clear();
      if (comment.isFailed) return this.deleteLocalComment(comment);
      const roomId = this.core.selected.id;
      const commentIds = [comment.unique_id];
      return this.core.deleteComment(roomId, commentIds, isForEveryone, true);
    },
    deleteLocalComment(comment) {
      const comments = this.core.selected.comments;
      const commentToBeFound = comments.findIndex(com => com.unique_id === comment.unique_id);
      if (commentToBeFound > -1) comments.splice(commentToBeFound, 1);
      return Promise.resolve(comments);
    },
    haveTemplate(comment) {
      if (!this.core.customTemplate) return false;
      return this.core.templateFunction(comment);
    },
    postbackSubmit(button) {
      const roomId = this.core.selected.id;
      const labelToSend = button.postback_text ? button.postback_text : button.label;
      this.core.sendComment(roomId, labelToSend, null, 'button_postback_response', JSON.stringify(button.payload));
    },
    openAccountBox() {
      window.open(this.comment.payload.url, 'AccountLinkingPopup', 'width=500,height=400,location=no,menubar=no,resizable=1,status=no,toolbar=no');
    },
    messageInfoHandler(comment) {
      if (this.core.options.messageInfoCallback) {
        this.core.options.messageInfoCallback(comment);
      }
    },
    menuMoreClicked(id) {
      const commentId = (this.currentMenuId === id) ? null : id;
      this.$emit('onChangeMenu', commentId);
    },
  },
};
</script>
