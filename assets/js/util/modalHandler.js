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
      if (this.modal || !modalId) { return; }
      if (callback) { callback(); }
      this.modal = document.querySelector(modalId);
      this.modal.style.animation = "modal-open 0.4s forwards";
      this.modal.style.display = 'flex';
   }
   /**
    * Close the current modal
    * @param {Function} callback A function to call after the modal is closed
    */
   close(callback) {
      if (!this.modal) { return; }
      this.modal.style.animation = "modal-close 0.4s forwards";
      setTimeout(() => {
         this.modal.style.display = 'none';
         this.modal = null;
         if (callback) { callback(); }
      }, 400);
   }

   /**
    * Get the current modal
    * @returns {HTMLElement} The current modal
    */
   getModal() {
      return this.modal;
   }
}

window.addEventListener('load', () => {
   const ModalHandlerInstance = new ModalHandler();
   //////////////// ModalOpener //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelectorAll('.modal-opener').forEach((opener) => {
      opener.addEventListener('click', () => {
         const target = opener.getAttribute('modal-target');
         ModalHandlerInstance.open(`div#${target}`);
      });
   });
   //////////////// openModal event //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('openModal', (opener) => {
      if (opener.detail.callback) {
         ModalHandlerInstance.open(opener.detail.target, opener.detail.callback);
      } else {
         ModalHandlerInstance.open(opener.detail.target);
      }
   });
   //////////////// modalCloser //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.querySelectorAll('.modal-closer').forEach((closer) => {
      closer.addEventListener('click', () => {
         if (!ModalHandlerInstance.getModal().contains(closer)) { return; }
         ModalHandlerInstance.close();
      });
   });
   //////////////// closeCurrentModal event //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   document.addEventListener('closeCurrentModal', (closer) => {
      if (closer.detail) {
         ModalHandlerInstance.close(closer.detail.callback);
      } else {
         ModalHandlerInstance.close();
      }
   });
});