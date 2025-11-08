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
         if (item.classList.contains('open')) { this.open(item); }
         item.addEventListener('click', (event) => {
            if (event.target.closest('.collapsible-content')) { return; }
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
    * @param {Element} target The collapsible to open
    * @returns {void}
    */
   open(target) {
      if (target === this.collapsible) { return; }
      target.querySelector('.collapsible-header')?.setAttribute('aria-expanded', 'true');
      target.classList.add('open');
      const content = target.querySelector('.collapsible-content');
      content.style.setProperty('--content-height', `${content.scrollHeight}px`);
      this.collapsible = target;
   }

   /**
    * Closes the currently open collapsible item.
    * @returns {void}
    */
   close() {
      if (!this.collapsible) { return; }
      const target = this.collapsible;
      target.classList.remove('open');
      target.classList.add('closing');
      setTimeout(() => {
         target.classList.remove('closing');
      }, 500);
      const targetContent = target.querySelector('.collapsible-content');
      targetContent.style.setProperty('--content-height', `${targetContent.scrollHeight}px`);
      target.querySelector('.collapsible-header')?.setAttribute('aria-expanded', 'false');
      this.collapsible = null;
   }
}

export default new CollapsibleHandler();