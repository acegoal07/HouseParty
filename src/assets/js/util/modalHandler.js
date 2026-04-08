class ModalHandler {
   constructor() {
      this._init();
   }

   /**
    * Initialize event listeners
    */
   _init() {
      this._setupOpeners();
      this._setupClosers();
      this._setupEvents();
   }

   /**
    * Setup event listeners for modal openers
    */
   _setupOpeners() {
      for (const opener of document.querySelectorAll('.modal-opener')) {
         opener.addEventListener('click', () => this.open(opener.dataset.modalTarget))
      }
   }

   /**
    * Setup event listeners for modal closers
    */
   _setupClosers() {
      for (const closer of document.querySelectorAll('.modal-closer')) {
         closer.addEventListener('click', () => {
            const dialog = closer.closest('dialog');
            if (dialog.getAttribute('open') !== null) {
               this.close();
            }
         });
      }
   }

   /**
    * Setup custom event listeners for opening and closing modals
    */
   _setupEvents() {
      document.addEventListener('openModal', event => {
         const { target, callback } = event.detail || {};
         this.open(target, callback);
      });

      document.addEventListener('closeCurrentModal', event => {
         const { callback } = event.detail || {};
         this.close(callback);
      });

      document.addEventListener('keydown', event => {
         if (event.key === 'Escape') {
            const modal = document.querySelector('dialog[open]');
            if (modal) {
               event.preventDefault();
               this.close();
            }
         }
      });
   }

   /**
    * Open a modal dialog
    * @param {String} target The element id
    * @param {Function} callback The callback function
    */
   open(target, callback = null) {
      const modal = document.querySelector(`dialog#${target}`);
      if (modal) {
         if (callback) { callback(); }
         modal.showModal();
      }
   }

   /**
    * Close the currently open modal
    * @param {Function} callback The callback function
    */
   close(callback = null) {
      const modal = document.querySelector('dialog[open]');
      if (modal) {
         if (globalThis.matchMedia(`(prefers-reduced-motion: reduce)`).matches) {
            modal.close();
            if (callback) { callback(); }
         } else {
            modal.classList.add('closing');
            setTimeout(() => {
               modal.close();
               modal.classList.remove('closing');
               if (callback) { callback(); }
            }, 300);
         }
      }
   }
}

export default new ModalHandler();