const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateCertificate = (user, course) => {
  const doc = new PDFDocument();
  const filePath = `uploads/certificates/${user.name}_${course}.pdf`;
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(25).text(`Certificate of Completion`, { align: 'center' });
  doc.moveDown();
  doc.text(`${user.name} has completed the course "${course}"`, { align: 'center' });
  doc.end();
  return filePath;
};

module.exports = generateCertificate;
