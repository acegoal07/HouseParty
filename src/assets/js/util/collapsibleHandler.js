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
         item.addEventListener('click', event => {
            if (event.target.tagName.toLowerCase() !== 'summary' && event.target.tagName.toLowerCase() !== 'details') { return; }
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

      if (globalThis.matchMedia(`(prefers-reduced-motion: reduce)`).matches) {
         target.open = true;
         target.setAttribute('aria-expanded', 'true');
      } else {
         const content = target.querySelector('.collapsible-content');
         const animation = content.getAnimations().find(animation => animation.animationName === 'close-collapsible');
         if (animation) {
            animation.pause();
            content.style.setProperty('--current-height', `${content.clientHeight}px`);
            target.classList.remove('closing');
         } else {
            content.style.setProperty('--current-height', `${content.clientHeight}px`);
         }

         target.open = true;
         target.setAttribute('aria-expanded', 'true');
         content.style.setProperty('--content-height', `${content.scrollHeight}px`);

         content.getAnimations().find(animation => animation.animationName === 'open-collapsible').onfinish = () => {
            if (target.classList.contains('closing')) { return; }
            content.style.removeProperty('--content-height');
            content.style.removeProperty('--current-height');
         }
      }

      this.collapsible = target;
   }

   /**
    * Closes the currently open collapsible element.
    * @returns {void}
    */
   close() {
      if (!this.collapsible) { return; }
      const target = this.collapsible;

      if (globalThis.matchMedia(`(prefers-reduced-motion: reduce)`).matches) {
         target.open = false;
         target.setAttribute('aria-expanded', 'false');
      } else {
         const content = target.querySelector('.collapsible-content');
         const animation = content.getAnimations().find(animation => animation.animationName === 'open-collapsible');
         if (animation) {
            animation.pause();
         }

         content.style.setProperty('--current-height', `${content.clientHeight}px`);

         target.classList.add('closing');

         content.getAnimations().find(animation => animation.animationName === 'close-collapsible').onfinish = () => {
            if (!target.classList.contains('closing')) { return; }
            target.open = false;
            target.setAttribute('aria-expanded', 'false');
            target.classList.remove('closing');
            content.style.removeProperty('--content-height');
            content.style.removeProperty('--current-height');
         }
      }

      this.collapsible = null;
   }
}

export default new CollapsibleHandler();