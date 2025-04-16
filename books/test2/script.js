document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const leafChapterPattern = /^book\d+-\d+$/;
    const containerId = 'bookContainer';
    const randomLinkId = 'randomChapterLink';

    // --- Get Elements ---
    const bookContainer = document.getElementById(containerId);
    const randomLink = document.getElementById(randomLinkId);
    let leafChapterSections = [];

    // ... (Keep findLeafChapterSections function as is) ...
     function findLeafChapterSections() {
       if (!bookContainer) return;
        const allElementsWithId = bookContainer.querySelectorAll('*[id]');
        leafChapterSections = Array.from(allElementsWithId).filter(el =>
            leafChapterPattern.test(el.id)
        );
    }

    // ... (Keep setupRandomLink function as is) ...
     function setupRandomLink() {
       if (!randomLink || !bookContainer) {
            if(randomLink) randomLink.style.display = 'none';
            return;
        }
        if (leafChapterSections.length === 0) {
             if(randomLink) randomLink.style.display = 'none';
             return;
         }
        randomLink.addEventListener('click', (event) => {
            event.preventDefault();
            const randomIndex = Math.floor(Math.random() * leafChapterSections.length);
            const randomSectionId = leafChapterSections[randomIndex].id;
            window.location.hash = `#${randomSectionId}`;
            randomLink.blur();
        });
    }

    /**
     * Handles focusing based on hash, applying classes for CSS-driven fading.
     */
    function handleHashChange() {
        if (!bookContainer) return;

        let hash = window.location.hash.substring(1);

        // 1. --- Clear any previous effects ---
        clearFadeEffect(); // Essential to reset state

        let targetElement = null;

        // 2. --- Determine the target element ---
        if (hash === 'random') {
            // Handle #random: Pick a leaf chapter, update hash and targetElement
            if (leafChapterSections.length > 0) {
                const randomIndex = Math.floor(Math.random() * leafChapterSections.length);
                targetElement = leafChapterSections[randomIndex];
                hash = targetElement.id; // Update hash to the specific chosen ID
                history.replaceState(null, '', `#${hash}`);
            } else {
                console.warn("Tried #random, but no leaf chapters found.");
                history.replaceState(null, '', window.location.pathname + window.location.search);
                return;
            }
        } else if (hash) {
            // Handle any other hash: Try to find the element by ID within the container
            try {
                // Test selector validity & find element scoped to container
                document.querySelector(`#${CSS.escape(hash)}`);
                targetElement = bookContainer.querySelector(`#${CSS.escape(hash)}`);
            } catch (e) {
                console.warn(`Invalid selector from hash: #${hash}. Error: ${e.message}`);
                targetElement = null;
            }

            if (targetElement && targetElement === bookContainer) {
                console.warn("Cannot target the main container itself.");
                targetElement = null; // Don't allow targeting the container
            } else if (!targetElement) {
                 // console.log(`Element with ID #${hash} not found within #${containerId}.`);
            }
        }

        // 3. --- Apply classes if a valid target was found ---
        if (targetElement) {
            // console.log(`Applying visibility classes for: ${targetElement.id}`);

            // Add the main flag class to the container - CSS rules depend on this
            bookContainer.classList.add('fade-active');

            // Add .visible-section to the specific target - CSS rules depend on this
            targetElement.classList.add('visible-section');

            // Walk up the DOM tree, adding .ancestor-visible - CSS rules depend on this
            let current = targetElement.parentElement;
            while (current && current !== bookContainer) {
                if (current.nodeType === 1 && current.classList) {
                    current.classList.add('ancestor-visible');
                }
                 // Safety break
                if (!current || current === document.body || current === document.documentElement) break;
                current = current.parentElement;
            }

            // Scroll the target section into view
            if (typeof targetElement.scrollIntoView === 'function') {
                // Slight delay can sometimes help ensure layout is ready after class changes
                setTimeout(() => {
                     targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50); // Adjust delay if needed, or remove if causes issues
            }
        }
         // If no targetElement, fade is already cleared by clearFadeEffect() above
    }

    /**
     * Removes all fade-related classes.
     */
    function clearFadeEffect() {
        if (!bookContainer) return;
        // console.log("Clearing fade effect classes.");
        bookContainer.classList.remove('fade-active'); // Remove container flag

        // Find elements with visibility classes and remove them
        const visibleElements = bookContainer.querySelectorAll('.visible-section, .ancestor-visible');
        visibleElements.forEach(el => {
            el.classList.remove('visible-section', 'ancestor-visible');
        });
    }

    // ... (Keep setupClearFadeOnClick function as is) ...
    function setupClearFadeOnClick() {
       if (!bookContainer) return;
        document.addEventListener('pointerdown', (event) => {
            if (bookContainer.classList.contains('fade-active') && event.target !== randomLink) {
                const clickedElement = event.target;
                 if (clickedElement.closest && clickedElement.closest('.visible-section, .ancestor-visible')) {
                      return; // Clicked inside visible area
                 }
                clearFadeEffect();
                 // history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }, true);
    }


    // --- Initialization ---
    if (bookContainer) {
        findLeafChapterSections(); // Needed for #random
        setupRandomLink();
        handleHashChange();      // Initial check
        setupClearFadeOnClick();
        window.addEventListener('hashchange', handleHashChange); // Listen for changes
    } else {
        console.error(`Book container with ID #${containerId} not found.`);
        if (randomLink) randomLink.style.display = 'none';
    }
});