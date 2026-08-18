// eslint-disable-next-line @typescript-eslint/no-require-imports
const { google } = require("googleapis");

// Drive API entegrasyonu
// Bu modül buluta veri göndermek için kullanılır.
// Hesabın kimliği: quantum.matrix.core@gmail.com

class DriveBridge {
  constructor(auth) {
    this.drive = google.drive({ version: "v3", auth });
  }

  async uploadFile(fileName, mimeType, fileStream) {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: mimeType,
        },
        media: {
          mimeType: mimeType,
          body: fileStream,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      throw error;
    }
  }

  // Diğer işlemler eklenebilir
}

module.exports = DriveBridge;
