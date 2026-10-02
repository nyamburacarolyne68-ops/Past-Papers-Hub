const SUPABASE_URL = "https://vtpwpeqogfyogxeuuwrq.supabase.co";

const SUPABASE_KEY = "sb_publishable_9JNbkhO1JkIEFSln7IgZIA_P-8xB1K2";

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const papersContainer = document.getElementById("papersContainer");

async function loadPapers() {

    const { data, error } = await client
        .from("past-paper")
        .select("*");

    if (error) {
        console.error(error);
        papersContainer.innerHTML = "<p>Cannot get papers.</p>";
        return;
    }

    if (!data || data.length === 0) {
        papersContainer.innerHTML = "<p>No past papers found.</p>";
        return;
    }

    papersContainer.innerHTML = "";

    data.forEach(paper => {

        const paperCard = document.createElement("div");

        paperCard.className = "paper-card";

        paperCard.innerHTML = `
            <h3>${paper.name || "Unnamed Paper"}</h3>

            <p><strong>Subject:</strong> ${paper.subject || "N/A"}</p>

            <p><strong>Institution:</strong> ${paper.institution || "N/A"}</p>

            <p><strong>Year:</strong> ${paper.year || "N/A"}</p>

            <p><strong>Exam Type:</strong> ${paper.exam_type || "N/A"}</p>

            <button onclick="downloadPaper('${paper.file_urls}')">
                📄 View / Download Paper
            </button>

            <button
                onclick="deletePaper('${paper.id}', '${paper.file_urls}')"
                style="background:#dc2626; margin-top:10px;"
            >
                🗑️ Delete Paper
            </button>
        `;

        papersContainer.appendChild(paperCard);
    });
}

loadPapers();


async function downloadPaper(fileUrl) {

    const filePath =
        fileUrl.split("/storage/v1/object/public/past-papers/")[1];

    const { data, error } = await client
        .storage
        .from("past-papers")
        .createSignedUrl(filePath, 60 * 60);

    if (error) {
        console.error(error);
        alert("Unable to open paper.");
        return;
    }

    window.open(data.signedUrl, "_blank");
}


async function deletePaper(id, fileUrl) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this paper?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        // Get file path from URL
        const filePath =
            fileUrl.split("/storage/v1/object/public/past-papers/")[1];

        // Delete file from Storage
        const { error: storageError } =
            await client
                .storage
                .from("past-papers")
                .remove([filePath]);

        if (storageError) {
            console.error(storageError);
            alert("Could not delete the paper file.");
            return;
        }

        // Delete record from database
        const { error: databaseError } =
            await client
                .from("past-paper")
                .delete()
                .eq("id", id);

        if (databaseError) {
            console.error(databaseError);
            alert("File deleted, but database record could not be deleted.");
            return;
        }

        alert("Paper deleted successfully.");

        // Refresh papers
        loadPapers();

    } catch (error) {

        console.error(error);
        alert("Something went wrong while deleting the paper.");
    }
}