const fs = require('fs');
const pdf = require('pdf-parse');

async function extract(path, outFile) {
    console.log('Extracting', path);
    try {
        let dataBuffer = fs.readFileSync(path);
        let data = await pdf(dataBuffer);
        fs.writeFileSync(outFile, data.text);
        console.log('Saved to', outFile);
    } catch (e) {
        console.error('Error extracting', path, e);
    }
}

async function run() {
    await extract(
        'D:\\Quiz\\Material\\POLÍTICA DE SEGURANÇA DA INFORMAÇÃO - PSI.pdf',
        'D:\\Quiz\\Material\\psi_text.txt'
    );
    await extract(
        'D:\\Quiz\\Material\\POLÍTICA DE proteção e privacidade de dados - PPDP.pdf',
        'D:\\Quiz\\Material\\ppdp_text.txt'
    );
}

run();
