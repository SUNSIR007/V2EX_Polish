import { createToast } from '../../components/toast'
import { StorageKey, V2EX } from '../../constants'
import { crawlTopicPage } from '../../services'
import { getRunEnv, getStorageSync } from '../../utils'
import { $topicList } from '../globals'

export function handleTopicList() {
  const runEnv = getRunEnv()

  if (!runEnv) {
    return
  }

  const storage = getStorageSync()

  const options = storage[StorageKey.Options]



  const $ignoreBtn = $('<span class="v2p-topic-ignore-btn">屏蔽</span>')

  $topicList.each((_, topicItem) => {
    const $topicItem = $(topicItem)
    const $itemTitle = $topicItem.find('.item_title')
    const $topicInfo = $topicItem.find('.topic_info')
    const topicTitle = $itemTitle.find('.topic-link').text()

    const linkHref = $topicItem.find('.topic-link').attr('href')
    const match = linkHref?.match(/\/t\/(\d+)/)
    const topicId = match?.at(1)

    $ignoreBtn
      .clone()
      .on('click', () => {
        if (confirm(`确定屏蔽主题 ⌈${topicTitle}⌋？`)) {
          if (typeof topicId === 'string') {
            void (async () => {
              const toast = createToast({ message: `正在屏蔽主题 ⌈${topicTitle}⌋`, duration: 0 })

              const pageText = await crawlTopicPage(`/t/${topicId}`, '0')

              const $ignoreBtn = $(pageText).find('.topic_buttons a:nth-of-type(3)')
              const txt = $ignoreBtn.attr('onclick')

              if (txt) {
                const match = txt.match(/'\/.*'/)

                if (match) {
                  const result = match[0].slice(1, -1)
                  if (result.startsWith('/ignore/topic')) {
                    try {
                      await fetch(`${V2EX.Origin}${result}`)
                      createToast({ message: `✅ 已屏蔽` })
                      $topicItem.remove()
                    } finally {
                      toast.clear()
                    }
                  }
                }
              }
            })()
          }
        }
      })
      .insertAfter($topicInfo.find('> span:first-of-type'))
  })
}
