/**
 * Book Navigation and Highlighting Script
 *
 * Features:
 * 1. Random Chapter Link: Navigates to a random 'bookX-Y' section.
 * 2. Sharable Random URL: A specific hash (#random-book) triggers navigation to a random chapter on load.
 * 3. Content Fading: Fades out all `.content-section` elements except the one targeted by a 'bookX-Y' hash.
 * 4. Specificity: Only applies fade/random logic to IDs starting with 'book' and matching the 'X-Y' pattern.
 * 5. Restore Visibility: Clicking anywhere on the page removes the fade effect.
 * 6. Robustness: Uses classes for fading, adaptable to various HTML structures.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const bookIdPrefix = 'book'; // Prefix for chapter IDs
    // Regex to validate book chapter IDs (e.g., book1-2, book10-15)
    const bookIdRegex = new RegExp(`^${bookIdPrefix}\\d+-\\d+$`);
    const randomChapterHash = '#random-book'; // Hash used for the sharable random link
    const randomChapterLinkId = 'random-chapter-link'; // ID of the "Random chapter" text link
    const contentSectionClass = 'content-section'; // Class added to all sections that can fade
    const fadeClass = 'faded'; // CSS class used for fading

    // --- Helper Functions ---

    /**
     * Finds all elements that are designated content sections and have an ID
     * matching the book chapter pattern.
     * @returns {Array<HTMLElement>} An array of book chapter section elements.
     */
    function findBookChapterSections() {
        const potentialSections = document.querySelectorAll(`.${contentSectionClass}[id^="${bookIdPrefix}"]`);
        return Array.from(potentialSections).filter(section => bookIdRegex.test(section.id));
    }

    /**
     * Gets the IDs of all valid book chapter sections.
     * @returns {Array<string>} An array of book chapter section IDs.
     */
    function getAllBookSectionIds() {
        const bookSections = findBookChapterSections();
        return bookSections.map(section => section.id);
    }

    /**
     * Selects a random ID from the list of book chapter IDs.
     * @returns {string|null} A random book chapter ID, or null if none are found.
     */
    function getRandomBookSectionId() {
        const bookIds = getAllBookSectionIds();
        if (bookIds.length === 0) {
            console.warn("No book chapter sections found matching the pattern.");
            return null;
        }
        const randomIndex = Math.floor(Math.random() * bookIds.length);
        return bookIds[randomIndex];
    }

    /**
     * Fades all content sections except the one with the target ID.
     * Scrolls the target section into view.
     * @param {string} targetId - The ID of the section to keep visible.
     */
    function fadeAllExcept(targetId) {
        const targetElement = document.getElementById(targetId);
        const allContentSections = document.querySelectorAll(`.${contentSectionClass}`);

        if (!targetElement) {
            console.warn(`Target element with ID "${targetId}" not found.`);
            unfadeAll(); // Unfade if target isn't valid
            return;
        }

        allContentSections.forEach(section => {
            if (section.id !== targetId) {
                section.classList.add(fadeClass);
            } else {
                section.classList.remove(fadeClass);
            }
        });

        // Scroll the target element into view
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log(`Mapsd to and focused on: #${targetId}`);
    }

    /**
     * Removes the fade effect from all content sections.
     */
    function unfadeAll() {
        const allContentSections = document.querySelectorAll(`.${contentSectionClass}`);
        allContentSections.forEach(section => {
            section.classList.remove(fadeClass);
        });
        console.log("Unfaded all sections.");
    }

    /**
     * Handles hash changes in the URL to trigger fading or unfading.
     */
    function handleHashChange() {
        const hash = window.location.hash; // e.g., #book1-2

        if (hash && hash !== '#') {
            const targetId = hash.substring(1); // Remove the '#'
            // Check if the hash corresponds to a valid book chapter ID
            if (bookIdRegex.test(targetId)) {
                fadeAllExcept(targetId);
            } else if (hash === randomChapterHash) {
                 // If the hash is explicitly the random one again (e.g., navigated back),
                 // trigger a new random jump.
                 navigateToRandomChapter();
            } else {
                // If the hash is something else (e.g., #intro), unfade all
                unfadeAll();
                 // Optional: scroll to the non-book element if it exists
                 const element = document.getElementById(targetId);
                 if (element) {
                     element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 }
            }
        } else {
            // No hash or just '#', unfade all
            unfadeAll();
        }
    }

     /**
      * Navigates to a random book chapter section by setting the hash.
      */
    function navigateToRandomChapter() {
        const randomId = getRandomBookSectionId();
        if (randomId) {
            console.log(`Randomly selected: #${randomId}`);
            // Setting the hash will trigger the 'hashchange' event listener
            window.location.hash = `#${randomId}`;
        } else {
             alert("Could not find any book chapters to navigate to.");
        }
    }


    // --- Event Listeners and Initialization ---

    // 1. Handle "Random chapter" link click
    const randomLink = document.getElementById(randomChapterLinkId);
    if (randomLink) {
        randomLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor link behavior
            navigateToRandomChapter();
        });
    } else {
        console.warn(`Element with ID "${randomChapterLinkId}" not found.`);
    }

    // 2. Handle click/tap anywhere on the page to unfade content
    document.body.addEventListener('click', (event) => {
        // Check if the click originated from the random link itself or another link
        // We don't want to immediately unfade if the click was *intended* to navigate/fade.
        // We only unfade if the click is on general page content *after* something is faded.
        if (document.querySelector(`.${contentSectionClass}.${fadeClass}`)) {
             // Check if the click target is NOT a link intended for navigation
            if (!event.target.closest('a[href^="#"]')) {
                 unfadeAll();
            }
        }
    });

    // 3. Listen for hash changes (user clicking links, back/forward buttons)
    window.addEventListener('hashchange', handleHashChange);

    // 4. Initial page load check:
    //   a) Check for the special #random-book hash
    //   b) Check for an existing book chapter hash
    if (window.location.hash === randomChapterHash) {
        // Use setTimeout to ensure the initial navigation stack is clear
        // before we redirect. This helps reliability on some browsers.
        setTimeout(navigateToRandomChapter, 0);
    } else {
        // Handle potential existing hash (e.g., bookmarked chapter) on load
        handleHashChange();
    }

    console.log("Book navigation script initialized.");

}); // End DOMContentLoaded