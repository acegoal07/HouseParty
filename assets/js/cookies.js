/**
 * setCookie
 * Stores a cookie with the name and value that's provided
 * @param {String} name The name of the cookie
 * @param {any} value The value of the cookie
 * @param {"Strict" | "Lax" | "None"} SameSite The type of SameSite to use
 * @param {Number} expires The number of days until the cookie expires
 */
function setCookie(name, value, SameSite = "Strict", expires = 1) {
   const date = new Date();
   date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
   document.cookie = `${name}=${value || ""}; expires=${date.toString()}; SameSite=${SameSite}; secure=true; path=/`;
}
/**
 * deleteCookie
 * Deletes the cookie with the provided name
 * @param {String} name The name of the cookie
 * @param {"Strict" | "Lax" | "None"} SameSite The type of SameSite to use
 */
function deleteCookie(name, SameSite = "Strict") {
   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=${SameSite}; secure=true; path=/;`;
}
/**
 * getCookie
 * Get's the value of the cookie with the provided name
 * @param {String} name The name of the cookie
 * @returns {any} The value of the cookie
 */
function getCookie(name) {
   const nameEQ = name + "=";
   for (let cookie of document.cookie.split(';')) {
      while (cookie.startsWith(' ')) {
         cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.startsWith(nameEQ)) {
         return cookie.substring(nameEQ.length, cookie.length);
      }
   }
   return null;
}
