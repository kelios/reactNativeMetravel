import React, { useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TextEditor = () => {
    const [editorHtml, setEditorHtml] = useState('');

    // Function to handle image upload
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            const formData = new FormData();
            formData.append('image', file);

            // Example of uploading image and then inserting it
            // You should replace this URL with your actual image upload endpoint
            const uploadUrl = 'https://your-image-upload-endpoint';
            fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(result => {
                    if (result.url) {
                        const range = this.quillRef.getEditor().getSelection();
                        this.quillRef.getEditor().insertEmbed(range.index, 'image', result.url);
                    }
                })
                .catch(error => {
                    console.error('Error uploading image: ', error);
                });
        };
    };

    // Add custom image button to the toolbar
    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['image'], // Button to trigger image upload
            ],
            handlers: {
                'image': imageHandler
            }
        }
    };

    return (
        <ReactQuill
            ref={(el) => { this.quillRef = el; }}
            value={editorHtml}
            onChange={setEditorHtml}
            modules={modules}
        />
    );
};

export default TextEditor;