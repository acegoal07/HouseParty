class CollapsibleHandler {
   constructor() {
      this.collapsible = null;
      this.init();
   }

   /**
    * Initialize event listeners
    */
   init() {
      this.setupCollapsibleItems();
   }

   /**
    * Open a collapsible
    * @param {HTMLElement} target The collapsible to open
    * @param {Function} callback The function to call before the collapsible is opened
    */
   open(target, callback) {
      if (target === this.collapsible) { return; }
      if (callback) { callback(); }
      this.collapsible = target;
      this.collapsible.classList.add('open');
      const content = this.collapsible.querySelector('div.collapsible-content');
      content.style.display = 'block';
      content.style.setProperty('--content-height', content.scrollHeight + 'px');
      content.style.animation = 'exapnd-collapsible-item 0.5s forwards';
   }

   /**
    * Close the current collapsible
    * @param {Function} callback The function to call after the collapsible is closed
    */
   close(callback) {
      if (!this.collapsible) { return; }
      this.collapsible.classList.remove('open');
      const content = this.collapsible.querySelector('div.collapsible-content');
      content.style.setProperty('--content-height', content.scrollHeight + 'px');
      content.style.animation = 'collapse-collapsible-item 0.5s forwards';
      this.collapsible = null;
      setTimeout(() => {
         if (callback) { callback(); }
         content.style.display = 'none';
      }, 500);
   }

   /**
    * Get the current collapsible
    * @returns {HTMLElement} The current collapsible
    */
   getCollapsible() {
      return this.collapsible;
   }

   /**
    * Setup event listeners for collapsible items
    */
   setupCollapsibleItems() {
      document.querySelectorAll('.collapsible-item').forEach((item) => {
         const toggleCollapsible = (event) => {
            if (event.type === 'click' || (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))) {
               if (!(event.target.classList.contains('collapsible-item') || event.target.classList.contains('collapsible-title') || event.target.classList.contains('collapsible-icon'))) {
                  return;
               } else if (this.collapsible === null) {
                  if (this.collapsible === item) {
                     this.close();
                  } else {
                     this.open(item);
                  }
               } else if (this.collapsible === item) {
                  this.close();
               } else {
                  this.close();
                  this.open(item);
               }
            }
         };
         item.addEventListener('click', toggleCollapsible);
         item.addEventListener('keydown', toggleCollapsible);
      });
   }
}

const collapsibleHandler = new CollapsibleHandler();