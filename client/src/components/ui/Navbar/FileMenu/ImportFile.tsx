import React from 'react';

const ImportFile: React.FC = () => {
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Handle file import logic here
            console.log('File imported:', file.name);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileImport} />
        </div>
    );
};

export default ImportFile;