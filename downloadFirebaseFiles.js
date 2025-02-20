const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(require("./serviceAccountKey.json")),
    storageBucket: "YOUR_PROJECT_NAME.appspot.com",
});

const bucket = admin.storage().bucket();

// Define the backup directory
const backupDir = path.join(__dirname, "firebase_backup");

// ✅ Ensure the backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Function to download all files while preserving folder structure
async function downloadFiles() {
    const [files] = await bucket.getFiles();

    for (const file of files) {
        let fileName = file.name;

        // ✅ Replace invalid characters (for OS compatibility)
        fileName = fileName.replace(/:/g, "-");

        // ✅ Keep the folder structure intact
        const filePath = path.join(backupDir, fileName);

        // ✅ Extract folder path and create missing directories
        const folderPath = path.dirname(filePath);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // ✅ Download file and maintain its folder structure
        try {
            await file.download({ destination: filePath });
            console.log(`✅ Downloaded: ${filePath}`);
        } catch (error) {
            console.error(`❌ Error downloading ${file.name}: ${error.message}`);
        }
    }
}

downloadFiles();
