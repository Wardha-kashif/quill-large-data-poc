import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactQuill from "react-quill";
import debounce from "lodash.debounce";
import "react-quill/dist/quill.snow.css";
import "./App.css";

const App = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const largeContent = useMemo(() => generateLargeContent(), []);

  // Debounced handleChange function
  const handleChange = useCallback(
    debounce((value) => {
      setContent(value);
    }, 300),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setContent(largeContent);
      setLoading(false);
    };
    fetchData();
  }, [largeContent]);

  // Calculate content size in MB
  const calculateSizeInMB = (text) => {
    const byteLength = new TextEncoder().encode(text).length;
    return (byteLength / (1024 * 1024)).toFixed(2); 
  };

  const contentSize = calculateSizeInMB(content);

  const handlePaste = useCallback(
    debounce((e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result;
            const range = quillRef.current.getEditor().getSelection();
            quillRef.current.getEditor().insertEmbed(range.index, "image", base64);
          };
          reader.readAsDataURL(file);
        }
      }
    }, 300), 
    []
  );


  const quillRef = React.useRef(null);

  return (
    <div className="App">
      <h1>Optimized Quill Editor</h1>
      {loading ? (
        <div className="loader"></div>
      ) : (
        <>
          <p>Content Size: {contentSize} MB</p>
          <ReactQuill
            ref={quillRef}
            value={content}
            onChange={handleChange}
            theme="snow"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image', 'video'],
                ['clean']
              ],
              clipboard: {
                matchVisual: false,
              }
            }}
            style={{ height: '500px', width: '100%' }}
            onPaste={(e) => {
              e.preventDefault(); 
              handlePaste(e); 
            }}
          />
        </>
      )}
    </div>
  );
};

function generateLargeContent() {
  return new Array(5000000).fill(null).map((_, i) => `Line ${i + 1}`).join('\n');
}


export default App;