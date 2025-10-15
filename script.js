// Wait for the entire HTML document to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const completeButton = document.getElementById('complete-btn');
    const completionList = document.getElementById('completion-list');
    const givenList = document.getElementById('given-list');

    const tabCompleted = document.getElementById('tab-completed');
    const tabGiven = document.getElementById('tab-given');

    const pageCompleted = document.getElementById('page-completed');
    const pageGiven = document.getElementById('page-given');

    // --- Constants ---

    const COMPLETED_STORAGE_KEY = 'completionEntries';
    const GIVEN_STORAGE_KEY = 'givenEntries';

    // --- Data Functions ---

    // Load entries from localStorage
    const loadCompletedEntries = () => {
        const entriesJSON = localStorage.getItem(COMPLETED_STORAGE_KEY);
        return entriesJSON ? JSON.parse(entriesJSON) : [];
    };

    // Save entries to localStorage
    const saveCompletedEntries = (entries) => {
        localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(entries));
    };

    // Load "given" entries from localStorage
    const loadGivenEntries = () => {
        const entriesJSON = localStorage.getItem(GIVEN_STORAGE_KEY);
        return entriesJSON ? JSON.parse(entriesJSON) : [];
    };

    // Save "given" entries to localStorage
    const saveGivenEntries = (entries) => {
        localStorage.setItem(GIVEN_STORAGE_KEY, JSON.stringify(entries));
    };

    // --- UI Functions ---

    /**
     * Creates a list item DOM element for a given text content.
     * @param {object} entryObject An object with `id` and `content` properties.
     * @returns {HTMLLIElement} The created list item element.
     */
    const createCompletedListItem = (entryObject) => {
        // Create the necessary elements
        const listItem = document.createElement('li');
        const textSpan = document.createElement('span');
        textSpan.className = 'list-item-text';
        textSpan.textContent = entryObject.content;
        const removeBtn = document.createElement('span');

        // Configure the remove button
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '⇄'; // Transfer arrow character
        removeBtn.onclick = () => {
            handleTransfer(entryObject, listItem);
        };

        // Assemble the list item
        listItem.appendChild(textSpan);
        listItem.appendChild(removeBtn);

        return listItem;
    };

    /**
     * Creates a list item for the "Given" page.
     * @param {object} entryObject An object with `completedOn` and `givenOn` properties.
     * @returns {HTMLLIElement} The created list item element.
     */
    const createGivenListItem = (entryObject) => {
        const listItem = document.createElement('li');
        const textContainer = document.createElement('div');
        textContainer.className = 'given-item-text';

        const completedText = document.createElement('div');
        completedText.textContent = entryObject.completedOn;

        const givenText = document.createElement('div');
        givenText.textContent = entryObject.givenOn;

        textContainer.appendChild(completedText);
        textContainer.appendChild(givenText);

        listItem.appendChild(textContainer);

        return listItem;
    };

    /**
     * Updates the text on the tabs to show the current count of items.
     */
    const updateTabCounts = () => {
        const completedCount = loadCompletedEntries().length;
        const givenCount = loadGivenEntries().length;

        tabCompleted.textContent = `Completed (${completedCount})`;
        tabGiven.textContent = `Given (${givenCount})`;
    };

    /**
     * Renders all saved entries to the list on the screen.
     */
    const renderList = () => {
        // Clear existing lists
        completionList.innerHTML = '';
        givenList.innerHTML = '';

        // Render "Completed" list
        const completedEntries = loadCompletedEntries();
        completedEntries.forEach(entryObject => {
            const listItem = createCompletedListItem(entryObject);
            completionList.appendChild(listItem);
        });

        // Render "Given" list
        const givenEntries = loadGivenEntries();
        givenEntries.forEach(entryObject => {
            const listItem = createGivenListItem(entryObject);
            givenList.appendChild(listItem);
        });
    };

    // --- Event Handlers ---

    // This function runs when the '+' button is clicked
    const handleAddEntry = () => {
        // 1. Get current date
        const now = new Date();

        // 2. Format the date into a readable string
        // We pass an options object to toLocaleDateString to get the full month name.
        const dateOptions = {
            year: 'numeric', // e.g., 2023
            month: 'long',   // e.g., October
            day: 'numeric'     // e.g., 26
        };
        const date = now.toLocaleDateString(undefined, dateOptions);

        // 3. Create the content string
        const content = `Completed on ${date}`;

        // 4. Create a unique entry object
        const newEntry = {
            id: now.getTime(), // Use timestamp as a unique ID
            content: content
        };

        // 5. Create the new list item element
        const listItem = createCompletedListItem(newEntry);

        // 6. Add the new list item to the top of the UI
        completionList.prepend(listItem);

        // 7. Save the new state to localStorage
        const currentEntries = loadCompletedEntries();
        currentEntries.unshift(newEntry); // Add new item to the beginning of the array
        saveCompletedEntries(currentEntries);
        updateTabCounts();
    };

    /**
     * Handles moving an item from the "Completed" list to the "Given" list.
     * @param {object} entryObject The entry object of the item being moved.
     * @param {HTMLLIElement} listItemElement The DOM element of the item.
     */
    const handleTransfer = (entryObject, listItemElement) => {
        // 1. Remove from "Completed" data and UI
        listItemElement.remove();
        let completedEntries = loadCompletedEntries();
        completedEntries = completedEntries.filter(entry => entry.id !== entryObject.id);
        saveCompletedEntries(completedEntries);

        // 2. Create new entry for "Given" list
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const givenDate = now.toLocaleDateString(undefined, dateOptions);

        const newGivenEntry = {
            completedOn: entryObject.content,
            givenOn: `Given on: ${givenDate}`
        };

        // 3. Add to "Given" data and UI
        const givenListItem = createGivenListItem(newGivenEntry);
        givenList.prepend(givenListItem);

        const givenEntries = loadGivenEntries();
        givenEntries.unshift(newGivenEntry);
        saveGivenEntries(givenEntries);
        updateTabCounts();
    };

    // --- Tab Navigation Handler ---

    const handleTabClick = (activeTab) => {
        if (activeTab === 'completed') {
            // Update button styles
            tabCompleted.classList.add('active');
            tabGiven.classList.remove('active');

            // Show/hide pages
            pageCompleted.classList.remove('hidden');
            pageGiven.classList.add('hidden');

            // Show the '+' button
            completeButton.style.display = 'block';
        } else if (activeTab === 'given') {
            // Update button styles
            tabGiven.classList.add('active');
            tabCompleted.classList.remove('active');

            // Show/hide pages
            pageGiven.classList.remove('hidden');
            pageCompleted.classList.add('hidden');

            // Hide the '+' button
            completeButton.style.display = 'none';
        }
    };

    // --- Reset Feature ---

    let pressTimer;
    let isResetMode = false;

    const enterResetMode = () => {
        isResetMode = true;
        completeButton.classList.add('reset-mode');
        completeButton.textContent = '⟳'; // Reset icon
    };

    const exitResetMode = () => {
        isResetMode = false;
        completeButton.classList.remove('reset-mode');
        completeButton.textContent = '+';
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all data in both tabs? This cannot be undone.")) {
            // Clear data from localStorage
            saveCompletedEntries([]);
            saveGivenEntries([]);

            // Re-render the empty lists
            renderList();

            // Update tab counts to zero
            updateTabCounts();
        }
        // Always exit reset mode after the action is confirmed or cancelled
        exitResetMode();
    };

    const handleButtonPress = () => {
        // Start a timer on button press
        pressTimer = window.setTimeout(enterResetMode, 3000); // 3 seconds
    };

    const handleButtonRelease = () => {
        // If the button is released before the timer finishes, cancel it
        clearTimeout(pressTimer);
    };

    const handleButtonClick = () => {
        if (isResetMode) {
            handleReset();
        } else {
            handleAddEntry();
        }
    };

    // --- Initial Load ---
    renderList(); // Load and display any saved entries when the app starts
    updateTabCounts(); // Set the initial counts on the tabs
    completeButton.addEventListener('click', handleButtonClick);
    tabCompleted.addEventListener('click', () => handleTabClick('completed'));
    tabGiven.addEventListener('click', () => handleTabClick('given'));
    // Add listeners for the long-press functionality
    completeButton.addEventListener('mousedown', handleButtonPress);
    completeButton.addEventListener('mouseup', handleButtonRelease);
    completeButton.addEventListener('mouseleave', handleButtonRelease); // Also cancel if mouse leaves button
});
