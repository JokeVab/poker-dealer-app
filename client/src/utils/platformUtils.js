/**
 * Утилиты для определения платформы устройства
 */

/**
 * Проверяет, является ли устройство iOS (iPhone, iPad, iPod)
 * @returns {boolean} true если устройство на iOS
 */
export const isIOS = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}; 