const { mdToPdf } = require('md-to-pdf');
const fs = require('fs');
const path = require('path');

const pdfOptions = {
  pdf_options: {
    format: 'Letter',
    margin: {
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in'
    },
    printBackground: true
  },
  stylesheet: [],
  css: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
    }
    
    h1 {
      color: #7c3aed;
      border-bottom: 3px solid #7c3aed;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    
    h2 {
      color: #6366f1;
      margin-top: 25px;
    }
    
    h3 {
      color: #8b5cf6;
      margin-top: 20px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    
    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    blockquote {
      border-left: 4px solid #7c3aed;
      padding-left: 20px;
      margin: 20px 0;
      font-style: italic;
      background: #f5f3ff;
      padding: 15px 20px;
      border-radius: 0 8px 8px 0;
    }
    
    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 30px 0;
    }
    
    ul, ol {
      padding-left: 25px;
    }
    
    li {
      margin: 8px 0;
    }
    
    strong {
      color: #4c1d95;
    }
    
    em {
      color: #6b7280;
    }
    
    a {
      color: #7c3aed;
      text-decoration: none;
    }
    
    .page-break {
      page-break-after: always;
    }
  `
};

async function convertToPdf(inputFile, outputFile) {
  try {
    console.log(`Converting ${inputFile} to ${outputFile}...`);
    
    const pdf = await mdToPdf(
      { path: inputFile },
      { 
        dest: outputFile,
        ...pdfOptions
      }
    );
    
    if (pdf) {
      console.log(`Successfully created: ${outputFile}`);
      return true;
    }
  } catch (error) {
    console.error(`Error converting ${inputFile}:`, error.message);
    return false;
  }
}

async function main() {
  const outputDir = 'public/downloads';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const files = [
    {
      input: 'ECHODEED_MIDDLE_SCHOOL_PRESENTATION.md',
      output: `${outputDir}/EchoDeed_Middle_School_Presentation.pdf`
    },
    {
      input: 'ECHODEED_ONE_PAGER.md',
      output: `${outputDir}/EchoDeed_One_Pager.pdf`
    },
    {
      input: 'ECHODEED_TALKING_POINTS.md',
      output: `${outputDir}/EchoDeed_Talking_Points.pdf`
    }
  ];
  
  console.log('Starting PDF generation...\n');
  
  for (const file of files) {
    if (fs.existsSync(file.input)) {
      await convertToPdf(file.input, file.output);
    } else {
      console.log(`File not found: ${file.input}`);
    }
  }
  
  console.log('\nPDF generation complete!');
  console.log(`\nDownload links will be available at:`);
  console.log(`- /downloads/EchoDeed_Middle_School_Presentation.pdf`);
  console.log(`- /downloads/EchoDeed_One_Pager.pdf`);
  console.log(`- /downloads/EchoDeed_Talking_Points.pdf`);
}

main();
