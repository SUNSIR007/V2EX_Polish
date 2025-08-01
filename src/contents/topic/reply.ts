import { createButton } from '../../components/button'
import { bindImageUpload } from '../../components/image-upload'
import { createPopup } from '../../components/popup'
import { emojiLinks, emoticons, type PopularEmoji } from '../../constants'
import { getOS } from '../../utils'
import { $body, $replyBox, $replyForm, $replyTextArea } from '../globals'
import { focusReplyInput, insertTextToReplyInput, transformEmoji } from '../helpers'

function handleReplyActions() {
  const os = getOS()

  const replyBtnText = `回复<kbd>${os === 'macos' ? 'Cmd' : 'Ctrl'}+Enter</kbd>`

  const $replyBtn = createButton({
    children: replyBtnText,
    type: 'submit',
  }).replaceAll($replyBox.find('input[type="submit"]'))

  $replyForm.on('submit', () => {
    const replyVal = $replyTextArea.val()

    if (typeof replyVal === 'string') {
      $replyTextArea.val(transformEmoji(replyVal))
    }

    $replyBtn.text('提交回复中...').prop('disabled', true)

    setTimeout(() => {
      $replyBtn.html(replyBtnText).prop('disabled', false)
    }, 5000)
  })

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault()
      $replyForm.trigger('submit')
    }
  })

  // 添加表情插入功能。
  {
    const emoticonGroup = $('<div class="v2p-emoji-group">')
    const emoticonList = $('<div class="v2p-emoji-list">')
    const emoticonSpan = $('<span class="v2p-emoji">')

    const groups = emoticons.map((emojiGroup) => {
      const group = emoticonGroup.clone()
      const list = emoticonList.clone()

      group.append(`<div class="v2p-emoji-title">${emojiGroup.title}</div>`)

      list.append(
        emojiGroup.list.map((emoji) => {
          const emoticon = emoticonSpan.clone()

          if (emojiGroup.title === '流行') {
            const emojiLink = emojiLinks[emoji as PopularEmoji].hd
            emoticon.html(`<img src="${emojiLink}" />`).prop('title', emoji)
          } else {
            emoticon.text(emoji)
          }

          emoticon.on('click', () => {
            insertTextToReplyInput(emoji)
          })
          return emoticon
        })
      )

      group.append(list)

      return group
    })

    const emoticonsBox = $('<div class="v2p-emoticons-box">').append(groups)

    const $emojiBtn = createButton({
      children: '<span style="width:18px; height:18px;"><i data-lucide="smile"></i></span>',
    }).insertAfter($replyBtn)

    const $emojiContent = $('<div class="v2p-emoji-container">')
      .append(emoticonsBox)
      .appendTo($replyBox)
      .on('click', () => {
        focusReplyInput()
      })

    const keyupHandler = (ev: JQuery.KeyDownEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        emojiPopup.close()
      }
    }

    $emojiBtn.on('click', () => {
      focusReplyInput()
    })

    const emojiPopup = createPopup({
      root: $replyBox,
      trigger: $emojiBtn,
      content: $emojiContent,
      options: { placement: 'right-end' },
      onOpen: () => {
        $body.on('keydown', keyupHandler) // 在 body 上监听，因为需要比关闭评论框的快捷键(Esc)先执行，否则会先关闭评论框。
      },
      onClose: () => {
        $body.off('keydown', keyupHandler)
      },
    })
  }

  // 给「取消回复框停靠」、「回到顶部」按钮添加样式。
  {
    $replyBox
      .find('#undock-button, #undock-button + a')
      .addClass('v2p-hover-btn')
      .css('padding', '5px 4px')
  }
}

export function handleReply() {
  $replyTextArea.attr('placeholder', '留下对他人有帮助的回复').wrap('<div class="v2p-reply-wrap">')

  const $replyWrap = $('.v2p-reply-wrap')

  bindImageUpload({
    $wrapper: $replyWrap,
    $input: $replyTextArea,
    insertText: (text: string) => {
      insertTextToReplyInput(text)
    },
    replaceText: (find: string, replace: string) => {
      const val = $replyTextArea.val()

      if (typeof val === 'string') {
        const newVal = val.replace(find, replace)
        $replyTextArea.val(newVal).trigger('focus')
      }
    },
  })



  // 移除原站的“请尽量让自己的回复能够对别人有帮助”。
  $('.flex-one-row:last-of-type > .gray').text('')

  handleReplyActions()
}
