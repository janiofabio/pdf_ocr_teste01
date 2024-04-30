// Função para processar os PDFs selecionados
async function processPDFs(pdfFiles) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; 

    const pdfjsLib = window['pdfjs-dist/build/pdf'];

    for (const file of pdfFiles) {

        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);

        await new Promise((resolve, reject) => {
            fileReader.onload = async () => {
                const arrayBuffer = fileReader.result;

                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const numPages = pdf.numPages;

                for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {

                    const page = await pdf.getPage(pageNumber);
                    const viewport = page.getViewport({ scale: 1.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    await page.render(renderContext).promise;

                    canvas.toBlob(async function(blob) {

                        const { data } = await Tesseract.recognize(blob, 'eng', {
                            logger: m => console.log(m), 
                        });

                        const text = data.text.trim(); 
                        outputDiv.innerHTML += `<div><h3>${file.name} - Página ${pageNumber}</h3><p>${text}</p></div>`;

                        resolve();
                    }, 'image/png');
                }
            };

            fileReader.onerror = error => reject(error);
        });
    }
}

document.getElementById('pdfInput').addEventListener('change', function(event) {
    const pdfFiles = event.target.files;
    if (pdfFiles.length > 0) {
        processPDFs(pdfFiles);
    }
});

document.getElementById('processButton').addEventListener('click', function() {
    const pdfFiles = document.getElementById('pdfInput').files;
    if (pdfFiles.length > 0) {
        processPDFs(pdfFiles);
    }
});
