const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const FINISHED_EVENT = 'finished-book';
const UNFINISHED_EVENT = 'unfinished-book';
const DELETED_EVENT = 'deleted-book';
const UPDATED_EVENT = 'updated-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();

        const inputBookTitle = document.getElementById('inputBookTitle');
        const inputBookAuthor = document.getElementById('inputBookAuthor');
        const inputBookYear = document.getElementById('inputBookYear');
        const inputBookIsComplete = document.getElementById('inputBookIsComplete');

        inputBookTitle.value = '';
        inputBookAuthor.value = '';
        inputBookYear.value = '';
        inputBookIsComplete.checked = false;
    });

    const submitEditForm = document.getElementById('editBook');
    submitEditForm.addEventListener('submit', function (event) {
        event.preventDefault();
        handleEditSubmit();

        selectedEditBook.splice(0, selectedEditBook.length);
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooks();
    });

    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.style.display = 'none';

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYearString = document.getElementById('inputBookYear').value;
    const bookYear = parseInt(bookYearString);
    const bookIsComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const unfinishedReading = document.getElementById('incompleteBookshelfList');
    unfinishedReading.innerHTML = '';

    const finishedReading = document.getElementById('completeBookshelfList');
    finishedReading.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete)
            unfinishedReading.append(bookElement);
        else
            finishedReading.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = '📘' + bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = bookObject.year;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, textYear, buttonContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    buttonContainer.innerHTML = '';

    if (bookObject.isComplete) {
        const unfinishedButton = createButton('Belum Selesai Dibaca', 'green', function () {
            unfinishedBookFromFinished(bookObject.id);
        });

        const trashButton = createButton('Hapus Buku', 'red', function () {
            removeBookFromFinished(bookObject.id);
        });

        const editButton = createButton('Edit', 'white', function () {
            editBook(bookObject.id);
        });

        buttonContainer.append(unfinishedButton, trashButton, editButton);
    } else {
        const finishedButton = createButton('Selesai Dibaca', 'green', function () {
            addBookToFinished(bookObject.id);
        });

        const trashButton = createButton('Hapus Buku', 'red', function () {
            removeBookFromFinished(bookObject.id);
        });

        const editButton = createButton('Edit', 'white', function () {
            editBook(bookObject.id);
        });

        buttonContainer.append(finishedButton, trashButton, editButton);
    }

    return container;
}

function createButton(text, className, clickHandler) {
    const button = document.createElement('button');
    button.innerText = text;
    button.classList.add(className);
    button.addEventListener('click', clickHandler);
    return button;
}

function addBookToFinished(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    finishedBookData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBookFromFinished(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    deleteBookData();
}

function unfinishedBookFromFinished(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    unfinishedBookData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveBookData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function () {
    let messageModal = "Buku dimasukkan ke rak!";
    showModal(messageModal);
});

function finishedBookData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(FINISHED_EVENT));
    }
}

document.addEventListener(FINISHED_EVENT, function () {
    let messageModal = "Buku sudah dibaca!";
    showModal(messageModal);
});

function deleteBookData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(DELETED_EVENT));
    }
}

document.addEventListener(DELETED_EVENT, function () {
    let messageModal = "Buku telah dihapus!";
    showModal(messageModal);
});

function unfinishedBookData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(UNFINISHED_EVENT));
    }
}

document.addEventListener(UNFINISHED_EVENT, function () {
    let messageModal = "Buku belum dibaca!";
    showModal(messageModal);
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const todo of data) {
            books.push(todo);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function showModal(message) {
    const modal = document.getElementById("myModal");
    const modalContent = document.getElementById("modalContent");
    const backdrop = document.getElementById("backdrop");

    modalContent.textContent = message;
    modal.style.display = "block";
    backdrop.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("myModal");
    const backdrop = document.getElementById("backdrop");

    modal.style.display = "none";
    backdrop.style.display = "none";
}

function closeModalEdit() {
    const editModal = document.getElementById("editModal");
    const backdrop2 = document.getElementById("backdrop2");

    backdrop2.style.display = "none";
    editModal.style.display = "none";
}

function searchBooks() {
    const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase();

    if (searchTerm === '') {
        const searchResultsContainer = document.getElementById('searchResults');
        searchResultsContainer.style.display = 'none';

        const unfnsBook = document.getElementById('unfnsBook');
        const fnsBook = document.getElementById('fnsBook');

        unfnsBook.style.display = 'block';
        fnsBook.style.display = 'block';
        return;
    }

    const searchResults = books.filter(book => book.title.toLowerCase().includes(searchTerm));

    displaySearchResults(searchResults);
}

function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById('searchResults');
    const resultBookshelf = document.getElementById('resultBookshelf');
    resultBookshelf.innerHTML = '';
    const searchResultCount = document.getElementById('searchResultCount');
    searchResultCount.innerText = results.length;

    if (results.length === 0) {
        const searchBookTitle = document.getElementById('searchBookTitle');
        searchBookTitle.value = '';
        searchResultsContainer.style.display = 'none';

        const unfnsBook = document.getElementById('unfnsBook');
        const fnsBook = document.getElementById('fnsBook');

        unfnsBook.style.display = 'block';
        fnsBook.style.display = 'block';

        showModal('Buku tidak ditemukan! 😢');
        return
    } else {
        results.forEach(book => {
            const bookElement = makeBook(book);
            resultBookshelf.appendChild(bookElement);
        });

        const unfnsBook = document.getElementById('unfnsBook');
        const fnsBook = document.getElementById('fnsBook');

        unfnsBook.style.display = 'none';
        fnsBook.style.display = 'none';
    }

    searchResultsContainer.style.display = 'block';
}

const selectedEditBook = [];

function editBook(bookId) {
    const bookToEdit = findBook(bookId);

    console.log(bookToEdit);

    if (bookToEdit == null) return;

    selectedEditBook.push(bookToEdit);

    const titleInput = document.getElementById("editBookTitle");
    const authorInput = document.getElementById("editBookAuthor");
    const yearInput = document.getElementById("editBookYear");

    titleInput.value = bookToEdit.title;
    authorInput.value = bookToEdit.author;
    yearInput.value = bookToEdit.year;

    const modal = document.getElementById("editModal");
    const backdrop2 = document.getElementById("backdrop2");
    modal.style.display = "block";
    backdrop2.style.display = "block";
}

function handleEditSubmit() {
    const getBookId = selectedEditBook[0].id;

    console.log(getBookId);

    const titleInput = document.getElementById("editBookTitle").value;
    const authorInput = document.getElementById("editBookAuthor").value;
    const yearInput = document.getElementById("editBookYear").value;

    const bookTarget = findBook(getBookId);
    bookTarget.id = getBookId;
    bookTarget.title = titleInput;
    bookTarget.author = authorInput;
    bookTarget.year = parseInt(yearInput);

    if (bookTarget == null) return;

    selectedEditBook.splice(0, selectedEditBook.length);
    document.dispatchEvent(new Event(RENDER_EVENT));
    updateBookData();
    closeModalEdit();
}

function updateBookData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(UPDATED_EVENT));
    }
}

document.addEventListener(UPDATED_EVENT, function () {
    let messageModal = "Buku berhasil diupdate!";
    showModal(messageModal);
});