// Accessibility utilities for enhanced user experience

/**
 * Focus management utilities
 */
export class FocusManager {
  static focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ].join(', ')

  static getFocusableElements(container = document) {
    return Array.from(container.querySelectorAll(this.focusableSelectors))
      .filter(element => {
        return element.offsetWidth > 0 || 
               element.offsetHeight > 0 || 
               element === document.activeElement
      })
  }

  static trapFocus(container) {
    const focusableElements = this.getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  static restoreFocus(element) {
    if (element && typeof element.focus === 'function') {
      // Use setTimeout to avoid conflicts with other focus operations
      setTimeout(() => {
        element.focus()
      }, 0)
    }
  }

  static saveFocus() {
    return document.activeElement
  }
}

/**
 * Screen reader announcements
 */
export class ScreenReaderAnnouncer {
  static liveRegion = null

  static initialize() {
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div')
      this.liveRegion.setAttribute('id', 'sr-announcer')
      this.liveRegion.setAttribute('aria-live', 'polite')
      this.liveRegion.setAttribute('aria-atomic', 'true')
      this.liveRegion.style.cssText = `
        position: absolute !important;
        left: -10000px !important;
        top: auto !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      `
      document.body.appendChild(this.liveRegion)
    }
  }

  static announce(message, priority = 'polite') {
    this.initialize()
    
    // Clear previous message
    this.liveRegion.textContent = ''
    
    // Set new priority
    this.liveRegion.setAttribute('aria-live', priority)
    
    // Announce new message
    setTimeout(() => {
      this.liveRegion.textContent = message
    }, 100)

    // Clear after announcement
    setTimeout(() => {
      this.liveRegion.textContent = ''
    }, 1000)
  }

  static announceError(message) {
    this.announce(`Error: ${message}`, 'assertive')
  }

  static announceSuccess(message) {
    this.announce(`Success: ${message}`, 'polite')
  }

  static announceNavigation(page) {
    this.announce(`Navigated to ${page}`, 'polite')
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigation {
  static KEYS = {
    ENTER: 'Enter',
    SPACE: ' ',
    TAB: 'Tab',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End'
  }

  static isActivationKey(event) {
    return event.key === this.KEYS.ENTER || event.key === this.KEYS.SPACE
  }

  static handleRovingTabIndex(container, options = {}) {
    const {
      selector = '[role="menuitem"], [role="option"], [role="tab"], button',
      orientation = 'both', // 'horizontal', 'vertical', 'both'
      wrap = true
    } = options

    const items = Array.from(container.querySelectorAll(selector))
    let currentIndex = 0

    // Set initial tabindex
    items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1
    })

    const moveFocus = (direction) => {
      items[currentIndex].tabIndex = -1

      switch (direction) {
        case 'next':
          currentIndex = wrap && currentIndex === items.length - 1 ? 0 : Math.min(currentIndex + 1, items.length - 1)
          break
        case 'previous':
          currentIndex = wrap && currentIndex === 0 ? items.length - 1 : Math.max(currentIndex - 1, 0)
          break
        case 'first':
          currentIndex = 0
          break
        case 'last':
          currentIndex = items.length - 1
          break
      }

      items[currentIndex].tabIndex = 0
      items[currentIndex].focus()
    }

    const handleKeyDown = (event) => {
      const { key } = event

      switch (key) {
        case this.KEYS.ARROW_RIGHT:
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault()
            moveFocus('next')
          }
          break
        case this.KEYS.ARROW_LEFT:
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault()
            moveFocus('previous')
          }
          break
        case this.KEYS.ARROW_DOWN:
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault()
            moveFocus('next')
          }
          break
        case this.KEYS.ARROW_UP:
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault()
            moveFocus('previous')
          }
          break
        case this.KEYS.HOME:
          event.preventDefault()
          moveFocus('first')
          break
        case this.KEYS.END:
          event.preventDefault()
          moveFocus('last')
          break
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // Update current index when focus changes
    const handleFocus = (event) => {
      const newIndex = items.indexOf(event.target)
      if (newIndex !== -1) {
        currentIndex = newIndex
      }
    }

    items.forEach(item => {
      item.addEventListener('focus', handleFocus)
    })

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      items.forEach(item => {
        item.removeEventListener('focus', handleFocus)
      })
    }
  }
}

/**
 * Color contrast utilities
 */
export class ColorContrast {
  static calculateLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  static calculateContrastRatio(color1, color2) {
    const [r1, g1, b1] = this.hexToRgb(color1)
    const [r2, g2, b2] = this.hexToRgb(color2)
    
    const lum1 = this.calculateLuminance(r1, g1, b1)
    const lum2 = this.calculateLuminance(r2, g2, b2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null
  }

  static meetsWCAGStandard(foreground, background, level = 'AA', size = 'normal') {
    const ratio = this.calculateContrastRatio(foreground, background)
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5
    }
  }
}

/**
 * Reduced motion utilities
 */
export class ReducedMotion {
  static prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  static respectReducedMotion(animation) {
    if (this.prefersReducedMotion()) {
      return {
        ...animation,
        transition: { duration: 0 },
        animate: animation.animate ? { ...animation.animate, transition: { duration: 0 } } : undefined
      }
    }
    return animation
  }

  static addReducedMotionListener(callback) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', callback)
    
    return () => {
      mediaQuery.removeEventListener('change', callback)
    }
  }
}

/**
 * ARIA utilities
 */
export class AriaUtils {
  static generateId(prefix = 'aria') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  static setAriaExpanded(element, expanded) {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  static setAriaSelected(element, selected) {
    element.setAttribute('aria-selected', selected.toString())
  }

  static setAriaChecked(element, checked) {
    element.setAttribute('aria-checked', checked.toString())
  }

  static setAriaHidden(element, hidden) {
    element.setAttribute('aria-hidden', hidden.toString())
  }

  static setAriaLabel(element, label) {
    element.setAttribute('aria-label', label)
  }

  static setAriaDescribedBy(element, id) {
    element.setAttribute('aria-describedby', id)
  }

  static setAriaLabelledBy(element, id) {
    element.setAttribute('aria-labelledby', id)
  }

  static createLiveRegion(politeness = 'polite', atomic = true) {
    const region = document.createElement('div')
    region.setAttribute('aria-live', politeness)
    region.setAttribute('aria-atomic', atomic.toString())
    region.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      top: auto !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    `
    document.body.appendChild(region)
    return region
  }
}

/**
 * Form accessibility utilities
 */
export class FormAccessibility {
  static associateLabels(form) {
    const inputs = form.querySelectorAll('input, select, textarea')
    
    inputs.forEach(input => {
      if (!input.id) {
        input.id = AriaUtils.generateId('input')
      }
      
      // Find associated label
      let label = form.querySelector(`label[for="${input.id}"]`)
      
      if (!label) {
        // Look for parent label
        label = input.closest('label')
      }
      
      if (label && !label.getAttribute('for')) {
        label.setAttribute('for', input.id)
      }
    })
  }

  static validateFormAccessibility(form) {
    const issues = []
    const inputs = form.querySelectorAll('input, select, textarea')
    
    inputs.forEach(input => {
      // Check for labels
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      form.querySelector(`label[for="${input.id}"]`) ||
                      input.closest('label')
      
      if (!hasLabel) {
        issues.push(`Input ${input.name || input.id} is missing a label`)
      }
      
      // Check required fields
      if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
        input.setAttribute('aria-required', 'true')
      }
      
      // Check error associations
      if (input.getAttribute('aria-invalid') === 'true') {
        const errorId = input.getAttribute('aria-describedby')
        if (!errorId || !form.querySelector(`#${errorId}`)) {
          issues.push(`Input ${input.name || input.id} has aria-invalid but no error message`)
        }
      }
    })
    
    return issues
  }

  static enhanceErrorHandling(form) {
    const inputs = form.querySelectorAll('input, select, textarea')
    
    inputs.forEach(input => {
      const showError = (message) => {
        let errorElement = form.querySelector(`#${input.id}-error`)
        
        if (!errorElement) {
          errorElement = document.createElement('div')
          errorElement.id = `${input.id}-error`
          errorElement.setAttribute('role', 'alert')
          errorElement.className = 'sr-only error-message'
          input.parentNode.appendChild(errorElement)
        }
        
        errorElement.textContent = message
        input.setAttribute('aria-invalid', 'true')
        input.setAttribute('aria-describedby', errorElement.id)
        
        // Announce error to screen readers
        ScreenReaderAnnouncer.announceError(message)
      }
      
      const clearError = () => {
        const errorElement = form.querySelector(`#${input.id}-error`)
        if (errorElement) {
          errorElement.textContent = ''
        }
        input.removeAttribute('aria-invalid')
        input.removeAttribute('aria-describedby')
      }
      
      input.addEventListener('invalid', (e) => {
        e.preventDefault()
        showError(input.validationMessage)
      })
      
      input.addEventListener('input', clearError)
    })
  }
}

/**
 * Image accessibility utilities
 */
export class ImageAccessibility {
  static enhanceImages(container = document) {
    const images = container.querySelectorAll('img')
    
    images.forEach(img => {
      // Ensure all images have alt text
      if (!img.hasAttribute('alt')) {
        console.warn('Image without alt text found:', img.src)
        img.setAttribute('alt', '')
      }
      
      // Handle decorative images
      if (img.getAttribute('alt') === '' || img.hasAttribute('data-decorative')) {
        img.setAttribute('role', 'presentation')
        img.setAttribute('aria-hidden', 'true')
      }
      
      // Handle loading states
      if (img.loading === 'lazy') {
        img.addEventListener('load', () => {
          if (img.alt && img.alt.trim()) {
            ScreenReaderAnnouncer.announce(`Image loaded: ${img.alt}`)
          }
        })
      }
    })
  }
}

/**
 * Main accessibility helper
 */
export class AccessibilityHelper {
  static initialize() {
    // Initialize screen reader announcements
    ScreenReaderAnnouncer.initialize()
    
    // Enhance all forms
    document.querySelectorAll('form').forEach(form => {
      FormAccessibility.associateLabels(form)
      FormAccessibility.enhanceErrorHandling(form)
    })
    
    // Enhance all images
    ImageAccessibility.enhanceImages()
    
    // Add reduced motion class if preferred
    if (ReducedMotion.prefersReducedMotion()) {
      document.documentElement.classList.add('reduce-motion')
    }
    
    // Listen for reduced motion changes
    ReducedMotion.addReducedMotionListener((e) => {
      document.documentElement.classList.toggle('reduce-motion', e.matches)
    })
    
    // Add focus-visible polyfill behavior
    this.initializeFocusVisible()
  }
  
  static initializeFocusVisible() {
    let hadKeyboardEvent = true
    const keyboardThrottleTimeout = 100
    
    const focusTriggersKeyboardModality = (e) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return false
      }
      
      switch (e.key) {
        case ' ':
        case 'Enter':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'Tab':
          return true
        default:
          return false
      }
    }
    
    const onKeyDown = (e) => {
      if (focusTriggersKeyboardModality(e)) {
        hadKeyboardEvent = true
      }
    }
    
    const onPointerDown = () => {
      hadKeyboardEvent = false
    }
    
    const onFocus = (e) => {
      if (hadKeyboardEvent) {
        e.target.classList.add('focus-visible')
      }
    }
    
    const onBlur = (e) => {
      e.target.classList.remove('focus-visible')
    }
    
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('mousedown', onPointerDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('touchstart', onPointerDown, true)
    document.addEventListener('focus', onFocus, true)
    document.addEventListener('blur', onBlur, true)
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AccessibilityHelper.initialize()
    })
  } else {
    AccessibilityHelper.initialize()
  }
}