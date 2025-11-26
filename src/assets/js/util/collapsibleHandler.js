class CollapsibleHandler {
   collapsible = null;

   constructor() {
      this._init();
   }

   /**
    * Initializes collapsible items by setting their state and adding event listeners.
    * @returns {void}
    */
   _init() {
      for (const item of document.querySelectorAll('details.collapsible-item')) {
         if (item.hasAttribute('open')) { this.open(item); }
         item.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');
         item.addEventListener('click', (event) => {
            if (event.target.tagName.toLowerCase() !== 'summary') { return; }
            event.preventDefault();
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
    * Opens the specified collapsible element.
    * @param {HTMLElement} target The collapsible element
    * @returns {void}
    */
   open(target) {
      if (target === this.collapsible) { return; }
      target.setAttribute('aria-expanded', 'true');
      target.open = true;
      const content = target.querySelector('.collapsible-content');
      content.style.setProperty('--content-height', `${content.scrollHeight}px`);
      this.collapsible = target;
   }

   /**
    * Closes the currently open collapsible element.
    * @returns {void}
    */
   close() {
      if (!this.collapsible) { return; }
      const target = this.collapsible;
      target.setAttribute('aria-expanded', 'false');
      target.classList.add('closing');
      setTimeout(() => {
         target.open = false;
         target.classList.remove('closing');
         const content = target.querySelector('.collapsible-content');
         content.style.removeProperty('--content-height');
      }, 500);
      this.collapsible = null;
   }
}

export default new CollapsibleHandler();