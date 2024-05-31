import React, { useState, useEffect } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import NavBar from "./utils/NavBar";
import { IoMdDownload } from "react-icons/io";
import { MdContentCopy } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const Dashboard = () => {
  const [filesInfo, setFilesInfo] = useState([]);
  const [totalUsedStorage, setTotalUsedStorage] = useState(0);
  const storageQuota = 1000 * 1024 * 1024; // Example quota of 100 MB

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const filePath = `files/${file.name}_${uuidv4()}`;
    const fileRef = ref(storage, filePath);

    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      const metadata = await getMetadata(fileRef);
      const fileInfo = {
        name: metadata.name,
        type: metadata.contentType,
        url,
        createdAt: metadata.timeCreated,
        size: metadata.size, // Add size to file info
        fullPath: filePath, // Store the full path for deletion
      };
      setFilesInfo((prevInfo) => [fileInfo, ...prevInfo]);
      setTotalUsedStorage((prevTotal) => prevTotal + metadata.size);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const filesListRef = ref(storage, "files/");
        const response = await listAll(filesListRef);
        const filesInfoPromises = response.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          return {
            name: metadata.name,
            type: metadata.contentType,
            url,
            createdAt: metadata.timeCreated,
            size: metadata.size, // Add size to file info
            fullPath: item.fullPath, // Store the full path for deletion
          };
        });
        const filesInfo = await Promise.all(filesInfoPromises);
        filesInfo.sort((a, b) => b.createdAt - a.createdAt);
        setFilesInfo(filesInfo);

        // Calculate total used storage
        const totalSize = filesInfo.reduce(
          (total, file) => total + file.size,
          0
        );
        setTotalUsedStorage(totalSize);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log("URL copied to clipboard:", url);
      })
      .catch((error) => {
        console.error("Error copying URL to clipboard:", error);
      });
  };

  const handleDelete = async (fullPath) => {
    const fileRef = ref(storage, fullPath);
    try {
      const metadata = await getMetadata(fileRef);
      await deleteObject(fileRef);
      setFilesInfo((prevInfo) =>
        prevInfo.filter((file) => file.fullPath !== fullPath)
      );
      setTotalUsedStorage((prevTotal) => prevTotal - metadata.size);
      console.log("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="dashboard">
      <NavBar />
      <div className="storage-info">
        <p>
          Total Used Storage: {(totalUsedStorage / (1024 * 1024)).toFixed(2)} MB
        </p>
        <br />
        <p>
          Remaining Storage:{" "}
          {((storageQuota - totalUsedStorage) / (1024 * 1024)).toFixed(2)} MB
        </p>
        <br />
      </div>
      <input type="file" onChange={handleFileChange} />
      {filesInfo.length > 0 && (
        <table className="file-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filesInfo.map((file, index) => (
              <tr key={index} className="file-row">
                <td>
                  <a href={file.url}>{file.name.slice(0, 30)} ...</a>
                </td>
                <td>{file.type}</td>
                <td>
                  <IoMdDownload
                    className="actions"
                    onClick={() => handleDownload(file.url)}
                  />
                  <MdContentCopy
                    className="actions"
                    onClick={() => handleCopyLink(file.url)}
                  />
                  <MdDelete
                    className="actions"
                    onClick={() => handleDelete(file.fullPath)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
