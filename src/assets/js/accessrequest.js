// Imports
import '@/assets/js/util/modalHandler.js';

// Initialize variables
let loadingIcon;
let nameInput;
let emailInput;

// send access request form
function sendAccessRequest(nameInput, emailInput) {
   loadingIcon.classList.remove("hide");
   fetch('api/v2/user/accessRequest.php', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         name: encodeURIComponent(nameInput),
         email: encodeURIComponent(emailInput)
      })
   })
      .then(response => response.json())
      .then(data => {
         if (data.success) {
            document.dispatchEvent(new CustomEvent('openModal', {
               detail: {
                  target: 'success-modal'
               }
            }));
         } else {
            document.dispatchEvent(new CustomEvent('openModal', {
               detail: {
                  target: 'failed-modal'
               }
            }));
         }
      })
      .then(() => {
         loadingIcon.classList.add("hide");
      })
      .catch(error => {
         console.error(error);
         loadingIcon.classList.add("hide");
      })
}

globalThis.addEventListener('load', () => {
   // Get DOM elements
   loadingIcon = document.querySelector('div#loading-icon');
   nameInput = document.querySelector('input#name');
   emailInput = document.querySelector('input#email');

   // Handle submission
   document.querySelector('form#access-request-form').addEventListener('submit', event => {
      event.preventDefault();
      sendAccessRequest(nameInput.value, emailInput.value);
   });

   // Handle retry submission
   document.querySelector('button#retry-button').addEventListener('click', event => {
      event.preventDefault();
      document.dispatchEvent(new CustomEvent('closeCurrentModal', {
         detail: {
            callback: () => {
               sendAccessRequest(nameInput.value, emailInput.value);
            }
         }
      }));
   });
});