// Configuration: Define the prefix required for anchor links to trigger the fade.
const FADE_ANCHOR_PREFIX = '#fade-';
    
// Get references to all elements that can be faded.
// We query this inside functions now if the DOM might change, but for this simple case, querying once is fine.
const contentBlocks = document.querySelectorAll('.content-block');

/**
 * Removes the 'is-faded' class from all content blocks.
 */
function removeAllFades() {
    // console.log('Removing all fades...');
    contentBlocks.forEach(block => {
        block.classList.remove('is-faded');
    });
}

/**
 * Applies the fade effect: fades out all blocks except the one with the target ID.
 * @param {string} targetId - The ID of the element to keep visible.
 * @returns {Element | null} - The target DOM element if found, otherwise null.
 */
function applyFade(targetId) {
    // console.log(`Applying fade, keeping #${targetId} visible...`);
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
        console.warn(`Target element with ID "${targetId}" not found.`);
        removeAllFades(); // If target doesn't exist, don't fade anything
        return null; // Return null if target not found
    }

    contentBlocks.forEach(block => {
        if (block !== targetElement) {
            block.classList.add('is-faded');
        } else {
            // Ensure the target element itself is not faded (in case it was previously)
            block.classList.remove('is-faded');
        }
    });

    return targetElement; // Return the found target element
}

/**
 * Handles click events anywhere on the document.
 * @param {Event} event - The click event object.
 */
function handleClick(event) {
    // First, check if the clicked element is, or is inside, an anchor link.
    const anchor = event.target.closest('a');

    // Check if the click was on a valid anchor link with the required prefix.
    if (anchor && anchor.hash && anchor.hash.startsWith(FADE_ANCHOR_PREFIX)) {
         // console.log('Fade anchor clicked:', anchor.hash);
         // Extract the target ID by removing the prefix.
         const targetId = anchor.hash.substring(FADE_ANCHOR_PREFIX.length);

         // Apply the fade effect.
         // Using setTimeout allows the browser's default scroll to anchor
         // triggered by the click to happen *before* the fade is applied visually.
         setTimeout(() => {
             applyFade(targetId);
             // No need to scroll explicitly here, the browser handles it for clicks.
         }, 0); // 0ms delay pushes execution after default click actions.

         // We DON'T prevent default scrolling (event.preventDefault()).
         // We let the browser handle jumping to the anchor for clicks.

    } else {
        // If the click was anywhere else OR on an anchor link WITHOUT the fade prefix,
        // remove any existing fade effect immediately.
        // console.log('Non-fade click or non-anchor click. Removing fades.');
        removeAllFades();
    }
}

/**
 * Checks the URL hash on page load and applies fade AND scroll if necessary.
 */
function checkInitialHashAndScroll() {
    // console.log('Checking initial hash:', window.location.hash);
    if (window.location.hash && window.location.hash.startsWith(FADE_ANCHOR_PREFIX)) {
        const targetId = window.location.hash.substring(FADE_ANCHOR_PREFIX.length);

        // Apply the fade effect *first*. This function now returns the target element.
        const targetElement = applyFade(targetId);

        // If the target element was found and the fade was applied...
        if (targetElement) {
            // console.log(`Scrolling to target #${targetId}`);
            // ...explicitly scroll that element into view.
            // Use 'smooth' for smooth scrolling, 'auto' for instant.
            // 'block: 'start'' tries to align the top of the element with the top of the viewport.
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // No need for setTimeout here anymore, we handle the scroll explicitly.
    }
}

// --- Event Listeners ---

// Listen for clicks anywhere on the document.
document.addEventListener('click', handleClick);

// Check the URL hash when the page finishes loading the main HTML structure.
// Explicitly scroll after applying fade for external links.
document.addEventListener('DOMContentLoaded', checkInitialHashAndScroll);

// Optional: Handle hash changes after load (back/forward buttons)
// window.addEventListener('hashchange', checkInitialHashAndScroll); // Uncomment if needed