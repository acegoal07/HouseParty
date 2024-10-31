class ModalHandler {
   constructor() {
      this.modal = null;
   }
   /**
    * Open a modal
    * @param {String} modalId The id of the modal to open
    * @param {Function} callback A function to call after the modal
    */
   open(modalId, callback) {
      if (this.modal || !modalId) {
         return;
      }
      if (callback) {
         callback();
      }
      this.modal = document.querySelector(modalId);
      this.modal.style.animation = "modal-open 0.4s forwards";
      this.modal.style.display = 'flex';
   }
   /**
    * Close the current modal
    * @param {Function} callback A function to call after the modal is closed
    */
   close(callback) {
      if (!this.modal) {
         return;
      }
      this.modal.style.animation = "modal-close 0.4s forwards";
      setTimeout(() => {
         this.modal.style.display = 'none';
         this.modal = null;
         if (callback) {
            callback();
         }
      }, 400);
   }
}

window.addEventListener('load', () => {
   const modalHandler = new ModalHandler();
   //////////////// ModalOpener //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelectorAll('.modal-opener').forEach((opener) => {
      opener.addEventListener('click', () => {
         const target = opener.getAttribute('modal-target');
         modalHandler.open(`div#${target}`);
      });
   });
   //////////////// openModal event //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('openModal', (opener) => {
      if (opener.detail.callback) {
         modalHandler.open(opener.detail.target, opener.detail.callback);
      } else {
         modalHandler.open(opener.detail.target);
      }
   });
   //////////////// modalCloser //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelectorAll('.modal-closer').forEach((closer) => {
      closer.addEventListener('click', () => {
         modalHandler.close();
      });
   });
   //////////////// closeCurrentModal event //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('closeCurrentModal', (closer) => {
      if (closer.detail) {
         modalHandler.close(closer.detail.callback);
      } else {
         modalHandler.close();
      }
   });
});