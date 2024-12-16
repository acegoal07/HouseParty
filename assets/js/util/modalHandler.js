class ModalHandler {
   constructor() {
      this.modal = null;
      this.init();
   }

   /**
    * Initialize event listeners
    */
   init() {
      window.addEventListener('load', () => {
         this.setupModalOpeners();
         this.setupModalClosers();
         this.setupCustomEvents();
      });
   }

   /**
    * Open a modal
    * @param {String} modalId The id of the modal to open
    * @param {Function} callback A function to call after the modal is opened
    */
   open(modalId, callback) {
      if (this.modal || !modalId) { return; }
      const modal = document.querySelector(modalId);
      if (!modal) {
         console.error(`Modal with id ${modalId} not found`);
         return;
      }
      if (callback) { callback(); }
      this.modal = modal;
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

   /**
    * Setup event listeners for modal openers
    */
   setupModalOpeners() {
      document.body.addEventListener('click', (event) => {
         const opener = event.target.closest('.modal-opener');
         if (opener) {
            const target = opener.getAttribute('modal-target');
            this.open(`div#${target}`);
         }
      });
   }

   /**
    * Setup event listeners for modal closers
    */
   setupModalClosers() {
      document.body.addEventListener('click', (event) => {
         const closer = event.target.closest('.modal-closer');
         if (closer && this.modal?.contains(closer)) {
            this.close();
         }
      });
   }

   /**
    * Setup custom event listeners for opening and closing modals
    */
   setupCustomEvents() {
      document.addEventListener('openModal', (event) => {
         if (event.detail) {
            const { target, callback } = event.detail;
            this.open(`div#${target}`, callback);
         } else {
            this.open(`div#${target}`);
         }
      });

      document.addEventListener('closeCurrentModal', (event) => {
         if (event.detail) {
            const { callback } = event.detail;
            this.close(callback);
         } else {
            this.close();
         }
      });
   }
}

const ModalHandlerInstance = new ModalHandler();