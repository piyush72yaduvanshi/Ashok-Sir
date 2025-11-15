import React, { useState, useRef } from "react";
import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function DragUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");

  const dropRef = useRef();

  // Drag Enter
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.add("border-blue-500");
  };

  // Drag Leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.remove("border-blue-500");
  };

  // Drop  
  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.classList.remove("border-blue-500");

    const img = e.dataTransfer.files[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img));
      setUrl("");
    }
  };

  // Upload Image
  const uploadImage = () => {
    if (!file) return alert("Please upload an image!");

    const imageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(imageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(Math.round(prog));
      },
      (error) => console.error(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUrl(downloadURL);
        });
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-xl">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Drag & Drop Image Upload
      </h2>

      {/* Drop Area */}
      <div
        ref={dropRef}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-400 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 transition"
      >
        <p className="text-gray-600">Drag & drop your image here</p>
        <p className="text-sm text-gray-400 mt-2">or</p>

        <label className="text-blue-500 cursor-pointer mt-2 underline">
          Choose a file
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
              setUrl("");
            }}
          />
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-4 text-center">
          <img
            src={preview}
            alt="preview"
            className="w-48 h-48 object-cover mx-auto rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={uploadImage}
        className="w-full bg-blue-600 text-white py-2 mt-4 rounded-lg hover:bg-blue-700"
      >
        Upload Image
      </button>

      {/* Progress Bar */}
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 h-3 rounded mt-4">
          <div
            className="bg-green-500 h-3 rounded transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Uploaded URL */}
      {url && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Uploaded Image URL:</h4>
          <p className="bg-gray-100 p-2 rounded break-all text-blue-700">
            {url}
          </p>

          <img
            src={url}
            alt="uploaded"
            className="mt-4 w-48 h-48 object-cover mx-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
