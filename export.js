const exportBtn = document.querySelector('#export');
exportBtn.addEventListener('click', () => {
  const CSV = document.querySelector('#exportCSV');
  const exportRows = Array.from(document.querySelectorAll('.tableRow'));
  const includeHeader = document.querySelector('#includeHeader');
  const tableHeadExport = document.querySelector('#tableHeadExport');

  function convertToCSV(data) {
    const header = includeHeader.checked ? Array.from(tableHeadExport.children).map(th => th.innerText).join(",") : '';
    const rows = data.map(row => {
      const rowData = Array.from(row.children).map(td => td.innerText);
      return rowData.join(",");
    });
    return `${header}\n${rows.join("\n")}`;
  }

  function downloadCSV(data) {
    const csv = convertToCSV(data);
    const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.href = csvURL;
    link.setAttribute("download", "export_data.csv");
    link.click();
    link.remove();
  }

  CSV.addEventListener('click', () => {
    downloadCSV(exportRows);
  });
});
