import { useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

const ChatbaseVisibility = () => {
  const location = useLocation()

  const hideChatbase = useCallback((show: boolean) => {
    const allChatbase = document.querySelectorAll('[id*="chatbase"], [class*="chatbase"], #yKnm64C1yjD8j-mn2HOb-')
    allChatbase.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (show) {
        htmlEl.style.visibility = ''
        htmlEl.style.pointerEvents = ''
        htmlEl.style.opacity = ''
      } else {
        htmlEl.style.visibility = 'hidden'
        htmlEl.style.pointerEvents = 'none'
        htmlEl.style.opacity = '0'
      }
    })
  }, [])

  useEffect(() => {
    const show = location.pathname === '/'

    // Hide immediately + after short delay for late renders
    hideChatbase(show)
    const t1 = setTimeout(() => hideChatbase(show), 100)
    const t2 = setTimeout(() => hideChatbase(show), 500)

    // Watch for Chatbase injecting elements after page refresh
    const observer = new MutationObserver(() => {
      hideChatbase(show)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    // Stop observing after 3s to avoid performance overhead
    const stopTimer = setTimeout(() => observer.disconnect(), 3000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(stopTimer)
      observer.disconnect()
    }
  }, [location.pathname, hideChatbase])

  return null
}

export default ChatbaseVisibility
