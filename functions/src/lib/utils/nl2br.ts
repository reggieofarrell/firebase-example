/**
 * Converts new lines to <br /> tags
 * @param {string} str
 * @returns {string}
 */
export const nl2br = (str: string) => {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
};
