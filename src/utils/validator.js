exports.validateFileUpload = (file) => {
  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
  const maxSize = 10 * 1024 * 1024; // 10 MB
  return file && allowedTypes.includes(file.mimetype) && file.size <= maxSize;
};
