document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const bookPrefix = "book"; // The prefix for chapter section IDs
    const containerId = 'bookContainer'; // The ID of the main content container
    const randomLinkId = 'randomChapterLink'; // The ID of the "Random chapter" link

    // --- Get Elements ---
    const bookContainer = document.getElementById(containerId);
    const randomLink = document.getElementById(randomLinkId);
    let bookSections = []; // Array to hold valid book section elements

    /**
     * Finds all direct child elements within the container whose IDs start
     * with the specified bookPrefix.
     */
    function findBookSections() {
        if (!bookContainer) return; // Exit if container not found

        // Query only direct children of the container
        const potentialSections = bookContainer.querySelectorAll(`:scope > [id^="${bookPrefix}"]`);
        bookSections = Array.from(potentialSections); // Convert NodeList to Array
        // console.log(`Found ${bookSections.length} book sections.`);
    }

    /**
     * Updates the "Random chapter" link's href to point to a random book section.
     * Prevents default link behavior and manually sets the hash.
     */
    function setupRandomLink() {
        if (!randomLink || bookSections.length === 0) {
            // console.log("Random link element not found or no book sections available.");
            if (randomLink) randomLink.style.display = 'none';
            return;
        }

        // Listen for clicks on the random link
        randomLink.addEventListener('click', (event) => {
            // *** STOP the browser from following the href automatically ***
            event.preventDefault();

            if (bookSections.length > 0) {
                const randomIndex = Math.floor(Math.random() * bookSections.length);
                const randomSectionId = bookSections[randomIndex].id;

                // *** Manually change the URL hash ***
                // This action WILL trigger the 'hashchange' event listener you already have.
                window.location.hash = `#${randomSectionId}`;
                // console.log(`Manually set hash to: #${randomSectionId}`);

                // Optional: Remove focus from the link after clicking.
                // This can sometimes help prevent the browser scrolling back to the link.
                randomLink.blur();

            } else {
                 // Although we prevented default, log if there's nothing to link to.
                 console.warn("No book sections found to link to.");
            }
        });

        // We no longer need to set an initial href on the link itself,
        // as we handle navigation entirely via the click event.
        // The href="#" is sufficient as a fallback/placeholder.
    }

    /**
     * Handles focusing on a specific section based on the URL hash.
     * Applies fade effect to other sections if the hash matches the book prefix.
     * Handles a special '#random' hash to jump to a random section.
     */
    function handleHashChange() {
        if (!bookContainer) return;

        const hash = window.location.hash.substring(1); // Get hash without '#'

        // Clear previous state first (important!)
        clearFadeEffect();

        // *** ADDITION: Check for the specific '#random' hash ***
        if (hash === 'random') {
            // console.log("Detected #random hash. Choosing a random section...");
            if (bookSections.length > 0) {
                // 1. Pick a random section
                const randomIndex = Math.floor(Math.random() * bookSections.length);
                const targetSection = bookSections[randomIndex];
                const targetSectionId = targetSection.id;

                // 2. IMPORTANT: Replace the '#random' hash with the actual chosen section's hash
                // This makes the final URL bookmarkable/shareable for the specific chapter chosen.
                // 'replaceState' modifies the URL without adding to browser history or re-triggering hashchange.
                history.replaceState(null, '', `#${targetSectionId}`);
                // console.log(`Updated hash to #${targetSectionId}`);

                // 3. Apply fade and scroll to the *chosen* section
                bookContainer.classList.add('fade-active');
                targetSection.classList.add('visible-section');
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            } else {
                console.warn("Tried to navigate to #random, but no book sections found.");
                // Optionally clear the hash if no sections exist
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
        // *** EXISTING Logic: Check for hashes starting with the book prefix ***
        else if (hash && hash.startsWith(bookPrefix)) {
            const targetSection = document.getElementById(hash);

            if (targetSection && bookSections.includes(targetSection)) {
                // console.log(`Focusing on section: #${hash}`);
                bookContainer.classList.add('fade-active');
                targetSection.classList.add('visible-section');
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // console.log(`Target section #${hash} not found or not a valid book section.`);
                // Hash starts with prefix but ID doesn't exist/isn't valid. Fade is already cleared.
            }
        }
        // *** ELSE: Hash is empty or doesn't match known patterns ***
        else {
            // console.log("Hash is empty or does not match known patterns. Ensuring fade is clear.");
            // Fade effect is already cleared by the call at the function start.
        }
    }

    /**
     * Removes the fade effect and visible markers from all sections.
     */
    function clearFadeEffect() {
        if (!bookContainer) return;
        // console.log("Clearing fade effect.");
        bookContainer.classList.remove('fade-active');
        // Remove 'visible-section' from any element that might have it
        const visible = bookContainer.querySelector('.visible-section');
        if (visible) {
            visible.classList.remove('visible-section');
        }
    }

    /**
     * Adds a listener to the document to clear the fade effect on any click/tap
     * when the fade effect is active.
     */
    function setupClearFadeOnClick() {
         // Use `mousedown` or `touchstart` for quicker response than `click`
        document.addEventListener('pointerdown', (event) => {
            // Only clear if the fade is active AND the click wasn't on the random link itself
            if (bookContainer.classList.contains('fade-active') && event.target !== randomLink) {
                 // Optional: Check if the click was inside the visible section's content area.
                 // If you want clicks *inside* the focused chapter to *not* clear the fade,
                 // you'd need more complex logic here, e.g., checking if event.target
                 // or its parents have the 'visible-section' class.
                 // For now, any click outside the random link clears the fade.

                // console.log("Click detected while faded, clearing effect.");
                clearFadeEffect();
                 // Optional: Remove the hash from the URL to prevent re-fading on refresh
                 // history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        }, true); // Use capture phase to catch click early
    }


    // --- Initialization ---
    findBookSections();      // Find sections on load
    setupRandomLink();       // Set up the random link behavior
    handleHashChange();      // Check hash on initial page load
    setupClearFadeOnClick(); // Set up the listener to clear fade on click

    // Listen for hash changes (e.g., user clicks back/forward, or clicks the random link)
    window.addEventListener('hashchange', handleHashChange);

});