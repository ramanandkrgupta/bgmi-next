import { useState } from 'react';
import { Input } from './input'; // Adjust the import path according to your file structure

export default function UploadForm() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log('Upload successful');
    } else {
      console.error('Upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        required
      />
      <button type="submit">Upload</button>
    </form>
  );
}