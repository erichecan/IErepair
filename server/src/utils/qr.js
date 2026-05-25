import QRCode from 'qrcode';

/**
 * Generate a QR code as a data-URI string (PNG base64).
 * @param {string} data — The content to encode in the QR code.
 * @returns {Promise<string>} Data-URI of the generated QR image.
 */
export async function generateQRCode(data) {
  return QRCode.toDataURL(String(data));
}

export default generateQRCode;
