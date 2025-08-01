import { StorageKey } from '../constants'
import { getStorageSync } from '../utils'

/**
 * 处理导航栏布局改进
 */
export function handleNavigationImprovements() {
  const storage = getStorageSync()
  const options = storage[StorageKey.Options]

  // 获取当前用户信息
  const $userLink = $('#Top .tools > a[href^="/member/"]').first()
  const userHref = $userLink.attr('href')
  const userName = $userLink.text()

  if (!userHref || !userName) {
    return // 用户未登录
  }

  // 获取用户头像
  const $rightbarAvatar = $('#Rightbar .avatar').first()
  const avatarSrc = $rightbarAvatar.attr('src') || `https://cdn.v2ex.com/gravatar/${userName}?s=64&d=identicon`

  // 获取主题切换按钮
  const $themeToggle = $('#Rightbar .light-toggle').first()
  const isNightMode = $themeToggle.find('img').attr('alt') === 'Light'

  // 创建新的导航元素
  const $newNavElements = $(`
    <a href="/" class="v2p-nav-btn v2p-nav-icon-only" title="首页">
      <span class="v2p-nav-icon">
        <i data-lucide="Home"></i>
      </span>
    </a>

    <a href="/notes" class="v2p-nav-btn v2p-nav-icon-only" title="记事本">
      <span class="v2p-nav-icon">
        <i data-lucide="Pen"></i>
      </span>
    </a>

    <a href="/planet" class="v2p-nav-btn v2p-nav-icon-only" title="Planet">
      <span class="v2p-nav-icon">
        <i data-lucide="Globe"></i>
      </span>
    </a>

    <a href="/solana/hodl" class="v2p-nav-btn v2p-nav-icon-only" title="HODL">
      <span class="v2p-nav-icon">
        <i data-lucide="Coins"></i>
      </span>
    </a>

    <a href="/notifications" class="v2p-nav-btn v2p-nav-icon-only" title="未读提醒">
      <span class="v2p-nav-icon">
        <i data-lucide="Bell"></i>
      </span>
      <span class="v2p-unread-badge" style="display: none;">0</span>
    </a>

    <a href="/write" class="v2p-nav-btn v2p-nav-icon-only" title="创作新主题">
      <span class="v2p-nav-icon">
        <i data-lucide="Plus"></i>
      </span>
    </a>

    <button class="v2p-nav-btn v2p-nav-icon-only v2p-theme-toggle" title="${isNightMode ? '切换到浅色主题' : '切换到深色主题'}">
      <span class="v2p-nav-icon">
        <i data-lucide="${isNightMode ? 'Sun' : 'Moon'}"></i>
      </span>
    </button>

    <a href="/settings" class="v2p-nav-btn v2p-nav-icon-only" title="设置">
      <span class="v2p-nav-icon">
        <i data-lucide="Settings"></i>
      </span>
    </a>

    <a href="${userHref}" class="v2p-user-avatar" title="${userName}">
      <img src="${avatarSrc}" alt="${userName}" />
    </a>
  `)

  // 设置新标签页打开
  if (options.openInNewTab) {
    $newNavElements.filter('a').prop('target', '_blank')
  }

  // 添加主题切换功能
  $newNavElements.filter('.v2p-theme-toggle').on('click', () => {
    if ($themeToggle.length > 0) {
      $themeToggle.trigger('click')
      // 更新按钮图标和标题
      setTimeout(() => {
        const newIsNightMode = $('#Wrapper').hasClass('Night')
        const $toggleBtn = $('.v2p-theme-toggle')
        $toggleBtn.attr('title', newIsNightMode ? '切换到浅色主题' : '切换到深色主题')
        $toggleBtn.find('i').attr('data-lucide', newIsNightMode ? 'Sun' : 'Moon')
        // 重新加载图标
        if (typeof window !== 'undefined' && (window as any).loadIcons) {
          (window as any).loadIcons()
        }
      }, 100)
    }
  })

  // 添加到导航栏
  const $tools = $('#Top .site-nav .tools')
  $tools.append($newNavElements)

  // 获取未读消息数量
  updateUnreadCount()

  // 定期更新未读消息数量（每5分钟）
  setInterval(updateUnreadCount, 5 * 60 * 1000)
}

/**
 * 更新未读消息数量
 */
async function updateUnreadCount() {
  try {
    const $unreadBadge = $('.v2p-unread-badge')
    
    // 检查右侧栏是否有未读提醒信息
    const $notificationLink = $('#Rightbar a[href^="/notifications"]')
    
    if ($notificationLink.length > 0) {
      const notificationText = $notificationLink.text()
      const match = notificationText.match(/(\d+)\s*条未读提醒/)
      
      if (match) {
        const count = parseInt(match[1], 10)
        if (count > 0) {
          const displayText = count > 99 ? '99+' : count.toString()
          $unreadBadge.text(displayText).show()

          // 根据数字大小调整样式
          if (count > 9) {
            $unreadBadge.addClass('v2p-unread-badge-large')
          } else {
            $unreadBadge.removeClass('v2p-unread-badge-large')
          }
        } else {
          $unreadBadge.hide()
        }
      } else {
        $unreadBadge.hide()
      }
    } else {
      $unreadBadge.hide()
    }
  } catch (error) {
    console.warn('Failed to update unread count:', error)
  }
}

/**
 * 处理搜索框改进
 */
export function handleSearchImprovements() {
  const $searchContainer = $('#search-container')
  const $searchInput = $('#q')
  
  if ($searchContainer.length === 0 || $searchInput.length === 0) {
    return
  }
  
  // 添加占位符文本
  if (!$searchInput.attr('placeholder')) {
    $searchInput.attr('placeholder', '搜索主题、用户...')
  }
  
  // 搜索框焦点事件
  $searchInput.on('focus', () => {
    $searchContainer.addClass('active')
  })
  
  $searchInput.on('blur', () => {
    if (!$searchInput.val()) {
      $searchContainer.removeClass('active')
    }
  })
  
  // 搜索框输入事件
  $searchInput.on('input', () => {
    const value = $searchInput.val() as string
    if (value.trim()) {
      $searchContainer.addClass('active')
    } else {
      $searchContainer.removeClass('active')
    }
  })
  
  // 回车搜索
  $searchInput.on('keypress', (e) => {
    if (e.which === 13) { // Enter key
      const value = $searchInput.val() as string
      if (value.trim()) {
        // 执行搜索
        window.location.href = `/search?q=${encodeURIComponent(value.trim())}`
      }
    }
  })
}

/**
 * 处理帖子列表紧凑化
 */
export function handleTopicListCompact() {
  // 减少帖子间的分隔符高度
  $('#Main .sep20').each((_, element) => {
    const $element = $(element)
    // 只处理帖子列表中的分隔符
    if ($element.prev('.cell.item').length > 0 || $element.next('.cell.item').length > 0) {
      $element.css('height', '8px')
    }
  })
  
  // 优化帖子项的内边距
  $('#Main .cell.item').each((_, element) => {
    const $element = $(element)
    $element.css({
      'margin-bottom': '6px',
      'padding': '12px 15px'
    })
  })
}

/**
 * 处理右侧栏隐藏后的布局调整
 */
export function handleRightbarHidden() {
  // 调整主内容区域的最大宽度
  const $main = $('#Main')
  const $wrapper = $('#Wrapper .content')
  
  // 移除原有的宽度限制
  $main.css({
    'max-width': 'none',
    'margin-right': '0'
  })
  
  // 确保内容区域使用flex布局
  $wrapper.css({
    'display': 'flex',
    'gap': 'var(--v2p-layout-column-gap)'
  })
}

/**
 * 初始化所有布局改进
 */
export function initLayoutImprovements() {
  // 等待DOM完全加载
  $(document).ready(() => {
    handleNavigationImprovements()
    handleSearchImprovements()
    handleTopicListCompact()
    handleRightbarHidden()
    
    // 加载图标
    setTimeout(() => {
      // 使用现有的loadIcons函数
      if (typeof window !== 'undefined' && (window as any).loadIcons) {
        (window as any).loadIcons()
      }
    }, 100)
  })
}
