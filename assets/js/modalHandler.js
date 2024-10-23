class ModalHandler {
   constructor() {
      this.modal = null;
   }

   /**
    * Open a modal
    * @param {String} modalId The id of the modal to open
    */
   open(modalId) {
      if (this.modal || !modalId) {
         return;
      }
      this.modal = document.querySelector(modalId);
      this.modal.style.animation = "modal-open 0.6s forwards";
      this.modal.style.display = 'flex';
   }

   /**
    * Close the current modal
    */
   close() {
      if (!this.modal) {
         return;
      }
      this.modal.style.animation = "modal-close 0.6s forwards";
      setTimeout(() => {
         this.modal.style.display = 'none';
         this.modal = null;
      }, 600);
   }
}