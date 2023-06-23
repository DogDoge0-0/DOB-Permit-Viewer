// Initialization
let CSV = document.querySelector('#exportCSV');
let done = document.querySelector('#exportDone');
let cancel = document.querySelector('#exportCancel');
let modal2 = document.querySelector('#exportModal2');
let exportRows = document.querySelectorAll('.tableRow');

// Change the second modal
$(modal2).modal({
  backdrop: 'static'
});
$(modal2).draggable();
