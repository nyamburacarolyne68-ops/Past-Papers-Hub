
const SUPABASE_URL = "https://vtpwpeqogfyogxeuuwrq.supabase.co";

const SUPABASE_KEY = "sb_publishable_9JNbkhO1JkIEFSln7IgZIA_P-8xB1K2";

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const uploadForm = document.getElementById("uploadForm");
const uploadMessage = document.getElementById("uploadMessage");

uploadForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    uploadMessage.textContent = "Uploading paper... Please wait.";

    const name = document.getElementById("name").value;
    const subject = document.getElementById("subject").value;
    const institution = document.getElementById("institution").value;
    const year = document.getElementById("year").value;
    const examType = document.getElementById("examType").value;
    const file = document.getElementById("paperFile").files[0];

    if (!file) {
        uploadMessage.textContent = "Please select a paper first.";
        return;
    }

    try {

        // Create a unique file name
        const fileName =
            Date.now() + "_" + file.name;

        // File location inside the bucket
        const filePath =
            "papers/" + fileName;

        // Upload the file to Supabase Storage
        const { data: uploadData, error: uploadError } =
            await client
                .storage
                .from("past-papers")
                .upload(filePath, file);

        if (uploadError) {
            console.error("Storage error:", uploadError);
            uploadMessage.textContent =
                "Paper upload failed: " + uploadError.message;
            return;
        }

        // Create the file URL
        const fileUrl =
            SUPABASE_URL +
            "/storage/v1/object/public/past-papers/" +
            filePath;

        // Save the student's details and paper information
        const { data, error } = await client
            .from("past-paper")
            .insert([
                {
                    name: name,
                    subject: subject,
                    institution: institution,
                    year: year,
                    exam_type: examType,
                    file_urls: fileUrl
                }
            ]);

        if (error) {
            console.error("Database error:", error);
            uploadMessage.textContent =
                "Paper uploaded, but details could not be saved: " +
                error.message;
            return;
        }

        uploadMessage.textContent =
            "Paper uploaded successfully!";

        uploadForm.reset();

    } catch (error) {

        console.error("Unexpected error:", error);

        uploadMessage.textContent =
            "Something went wrong. Please try again.";
    }

});