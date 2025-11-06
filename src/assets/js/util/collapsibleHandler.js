class CollapsibleHandler {
   collapsible = null;

   constructor() {
      this._setupCollapsibleItems();
   }

   /**
    * Setup event listeners for collapsible items
    */
   _setupCollapsibleItems() {
      for (const item of document.querySelectorAll('.collapsible-item')) {
         item.addEventListener('click', (e) => {
            if (e.target.closest('.collapsible-content')) { return; }
            if (this.collapsible === item) {
               this.close();
            } else {
               if (this.collapsible) { this.close(); }
               this.open(item);
            }
         });
      }
   }

   /**
    * Opens a collapsible item.
    * @param {Element} item The collapsible item to open
    * @returns {void}
    */
   open(item) {
      if (item === this.collapsible) { return; }
      item.querySelector('.collapsible-header')?.setAttribute('aria-expanded', 'true');
      item.classList.add('open');
      const content = item.querySelector('.collapsible-content');
      content.style.setProperty('--content-height', `${content.scrollHeight}px`);
      this.collapsible = item;
   }

   /**
    * Closes the currently open collapsible item.
    * @returns {void}
    */
   close() {
      if (!this.collapsible) { return; }
      const item = this.collapsible;
      item.classList.remove('open');
      item.classList.add('closing');
      setTimeout(() => {
         item.classList.remove('closing');
      }, 500);
      const content = item.querySelector('.collapsible-content');
      content.style.setProperty('--content-height', `${content.scrollHeight}px`);
      item.querySelector('.collapsible-header')?.setAttribute('aria-expanded', 'false');
      this.collapsible = null;
   }
}

export default new CollapsibleHandler();