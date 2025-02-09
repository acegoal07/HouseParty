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
   }

   /**
    * Close the current collapsible
    * @param {Function} callback The function to call after the collapsible is closed
    */
   close(callback) {
      if (!this.collapsible) { return; }
      this.collapsible.classList.remove('open');
      this.collapsible = null;
      setTimeout(() => {
         if (callback) { callback(); }
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
         item.addEventListener('click', (event) => {
            console.log("hello")
            if (this.collapsible === null) {
               if (this.collapsible === item) {
                  this.close();
               } else {
                  this.open(item);
               }
            } else if (this.collapsible === item && (event.target.classList.contains('collapsible-item') || event.target.classList.contains('collapsible-title') || event.target.classList.contains('collapsible-icon'))) {
               this.close();
            } else {
               this.close();
               setTimeout(() => {
                  this.open(item);
               }, 100);
            }
         });
      });
   }
}

const collapsibleHandler = new CollapsibleHandler();