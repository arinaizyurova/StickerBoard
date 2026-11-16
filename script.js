const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const board = document.getElementById("board");
const message = document.getElementById("message");
const colors = ["#fff1a8", "#d9eaba", "#cce4f5", "#f5d1dc"];
let noteNumber = 0;
let topLayer = 0;
let draggedNote = null;
let offsetX = 0;
let offsetY = 0;

// Создаём стикер по примеру из файла преподавателя.
document.getElementById("noteForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (text === "") {
        message.textContent = "Сначала введите текст стикера.";
        taskInput.focus();
        return;
    }

    const note = document.createElement("div");
    note.className = "sticker";
    note.id = "note-" + noteNumber;
    note.draggable = true;
    note.style.backgroundColor = colors[noteNumber % colors.length];
    noteNumber++;

    const paragraph = document.createElement("p");
    paragraph.className = "note-text";
    paragraph.textContent = text;
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-note";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Удалить стикер: " + text);
    deleteButton.addEventListener("click", function() {
        note.remove();
        message.textContent = "Стикер удалён.";
    });
    // Кнопка удаления не должна начинать перетаскивание.
    deleteButton.addEventListener("mousedown", function(event) {
        event.stopPropagation();
    });
    note.append(paragraph, deleteButton);
    taskList.append(note);

    note.addEventListener("dragstart", function(event) {
        draggedNote = note;
        const rect = note.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        event.dataTransfer.setData("text/plain", note.id);
        event.dataTransfer.effectAllowed = "move";
        note.classList.add("dragging");
    });
    note.addEventListener("dragend", function() {
        note.classList.remove("dragging");
        board.classList.remove("drop-active");
        taskList.classList.remove("drop-active");
        draggedNote = null;
    });

    taskInput.value = "";
    taskInput.focus();
    message.textContent = "Стикер добавлен. Перетащите его на доску.";
});

// Ограничиваем координату, чтобы стикер целиком оставался внутри доски.
function limit(value, maximum) {
    return Math.max(0, Math.min(value, Math.max(0, maximum)));
}

function allowDrop(area) {
    area.addEventListener("dragover", function(event) {
        if (!draggedNote) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        area.classList.add("drop-active");
    });
    area.addEventListener("dragleave", function(event) {
        if (!area.contains(event.relatedTarget)) area.classList.remove("drop-active");
    });
}
allowDrop(board);
allowDrop(taskList);

board.addEventListener("drop", function(event) {
    event.preventDefault();
    board.classList.remove("drop-active");
    if (!draggedNote) return;
    const note = draggedNote;
    const rect = board.getBoundingClientRect();
    board.append(note);
    note.style.position = "absolute";
    // Учитываем рамку доски и место захвата стикера мышью.
    const x = event.clientX - rect.left - board.clientLeft - offsetX;
    const y = event.clientY - rect.top - board.clientTop - offsetY;
    note.style.left = limit(x, board.clientWidth - note.offsetWidth) + "px";
    note.style.top = limit(y, board.clientHeight - note.offsetHeight) + "px";
    note.style.zIndex = ++topLayer;
    message.textContent = "Стикер размещён на доске.";
});

taskList.addEventListener("drop", function(event) {
    event.preventDefault();
    taskList.classList.remove("drop-active");
    if (!draggedNote) return;
    taskList.append(draggedNote);
    draggedNote.style.position = "relative";
    draggedNote.style.left = "";
    draggedNote.style.top = "";
    draggedNote.style.zIndex = "";
    message.textContent = "Стикер возвращён в список.";
});

document.getElementById("clearList").addEventListener("click", function() {
    taskList.replaceChildren();
    message.textContent = "Поле со стикерами очищено. Заметки на доске сохранены.";
});
document.getElementById("clearBoard").addEventListener("click", function() {
    board.replaceChildren();
    message.textContent = "Доска очищена. Заметки в списке сохранены.";
});

// При уменьшении окна возвращаем заметки в видимую область.
window.addEventListener("resize", function() {
    for (const note of board.children) {
        note.style.left = limit(parseFloat(note.style.left), board.clientWidth - note.offsetWidth) + "px";
        note.style.top = limit(parseFloat(note.style.top), board.clientHeight - note.offsetHeight) + "px";
    }
});
