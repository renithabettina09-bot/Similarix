/* =========================
   GET ELEMENTS
========================= */

const fileA = document.getElementById("fileA");
const fileB = document.getElementById("fileB");

const nameA = document.getElementById("nameA");
const nameB = document.getElementById("nameB");

const checkBtn = document.getElementById("checkBtn");

const statusDiv = document.getElementById("status");

const resultPanel =
    document.getElementById("resultPanel");

const loader =
    document.getElementById("loader");

const ocrToggle =
    document.getElementById("ocrToggle");

const scoreNumber =
    document.getElementById("scoreNumber");

const scoreCircle =
    document.getElementById("scoreCircle");

const resultTitle =
    document.getElementById("resultTitle");

const resultMessage =
    document.getElementById("resultMessage");

const resultBadge =
    document.getElementById("resultBadge");

const wordsCount =
    document.getElementById("wordsCount");

const matchedCount =
    document.getElementById("matchedCount");

const chunkDisplay =
    document.getElementById("chunkDisplay");

const resultFileA =
    document.getElementById("resultFileA");

const resultFileB =
    document.getElementById("resultFileB");

const themeBtn =
    document.getElementById("themeBtn");


/* =========================
   FILE SELECTION
========================= */

fileA.addEventListener("change", () => {

    if (fileA.files[0]) {

        nameA.textContent =
            "✓ " + fileA.files[0].name;

    } else {

        nameA.textContent =
            "No file selected";

    }

});


fileB.addEventListener("change", () => {

    if (fileB.files[0]) {

        nameB.textContent =
            "✓ " + fileB.files[0].name;

    } else {

        nameB.textContent =
            "No file selected";

    }

});


/* =========================
   DRAG AND DROP
========================= */

const dropA =
    document.getElementById("dropA");

const dropB =
    document.getElementById("dropB");


function setupDropZone(dropZone, fileInput, nameElement) {

    dropZone.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            dropZone.style.borderColor =
                "#4f46e5";

        }
    );


    dropZone.addEventListener(
        "dragleave",
        () => {

            dropZone.style.borderColor =
                "#c7d2fe";

        }
    );


    dropZone.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            const files =
                event.dataTransfer.files;

            if (files.length > 0) {

                const dataTransfer =
                    new DataTransfer();

                dataTransfer.items.add(
                    files[0]
                );

                fileInput.files =
                    dataTransfer.files;

                nameElement.textContent =
                    "✓ " + files[0].name;

            }

            dropZone.style.borderColor =
                "#c7d2fe";

        }
    );

}


setupDropZone(
    dropA,
    fileA,
    nameA
);

setupDropZone(
    dropB,
    fileB,
    nameB
);


/* =========================
   CHECK SIMILARITY
========================= */

checkBtn.addEventListener(
    "click",
    async () => {


        /* CHECK FILES */

        if (
            !fileA.files[0] ||
            !fileB.files[0]
        ) {

            statusDiv.textContent =
                "⚠ Please upload both documents.";

            return;

        }


        const chunkSize =
            parseInt(
                document.getElementById(
                    "chunkSize"
                ).value
            ) || 5;


        const useOcr =
            ocrToggle.checked;


        /* RESET */

        checkBtn.disabled = true;

        resultPanel.style.display =
            "none";

        loader.style.display =
            "block";

        statusDiv.textContent =
            "Preparing document analysis...";


        try {


            /* DOCUMENT A */

            statusDiv.textContent =
                "📄 Reading original document...";


            const resultA =
                await extractText(
                    fileA.files[0],
                    {

                        useOcr,

                        onStatus: (message) => {

                            statusDiv.textContent =
                                "Document A: " + message;

                        }

                    }
                );


            /* DOCUMENT B */

            statusDiv.textContent =
                "📄 Reading document to check...";


            const resultB =
                await extractText(
                    fileB.files[0],
                    {

                        useOcr,

                        onStatus: (message) => {

                            statusDiv.textContent =
                                "Document B: " + message;

                        }

                    }
                );


            /* COMPARISON */

            statusDiv.textContent =
                "🔍 Comparing documents using Trie + Hashing...";


            await new Promise(
                resolve =>
                    setTimeout(resolve, 500)
            );


            const result =
                compareDocuments(
                    resultA.text,
                    resultB.text,
                    chunkSize
                );


            /* SCORE */

            const similarity =
                result.similarity;


            scoreNumber.textContent =
                similarity + "%";


            const degrees =
                similarity * 3.6;


            let scoreColor =
                "#22c55e";


            /* RESULT TYPE */

            if (similarity < 30) {

                resultTitle.textContent =
                    "Low Similarity";

                resultMessage.textContent =
                    "The documents have minimal matching content.";

                resultBadge.textContent =
                    "LOW SIMILARITY";

                resultBadge.style.background =
                    "#dcfce7";

                resultBadge.style.color =
                    "#15803d";

                scoreColor =
                    "#22c55e";

            }


            else if (similarity < 60) {

                resultTitle.textContent =
                    "Medium Similarity";

                resultMessage.textContent =
                    "The documents contain some matching content.";

                resultBadge.textContent =
                    "MEDIUM SIMILARITY";

                resultBadge.style.background =
                    "#fef3c7";

                resultBadge.style.color =
                    "#b45309";

                scoreColor =
                    "#f59e0b";

            }


            else {

                resultTitle.textContent =
                    "High Similarity";

                resultMessage.textContent =
                    "A large amount of matching content was detected.";

                resultBadge.textContent =
                    "HIGH SIMILARITY";

                resultBadge.style.background =
                    "#fee2e2";

                resultBadge.style.color =
                    "#dc2626";

                scoreColor =
                    "#ef4444";

            }


            /* CIRCLE */

            scoreCircle.style.background =
                `conic-gradient(
                    ${scoreColor} ${degrees}deg,
                    #e2e8f0 ${degrees}deg
                )`;


            /* STATS */

            wordsCount.textContent =
                result.wordsB.length;


            matchedCount.textContent =
                result.matchedInB.size;


            chunkDisplay.textContent =
                chunkSize;


            /* FILE NAMES */

            resultFileA.textContent =
                fileA.files[0].name;


            resultFileB.textContent =
                fileB.files[0].name;


            /* SHOW RESULT */

            loader.style.display =
                "none";


            resultPanel.style.display =
                "block";


            statusDiv.textContent =
                "✓ Analysis completed successfully!";


            resultPanel.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });


        }


        catch (error) {


            console.error(error);


            loader.style.display =
                "none";


            statusDiv.textContent =
                "❌ Error: " +
                error.message;


        }


        finally {


            checkBtn.disabled =
                false;

        }


    }
);


/* =========================
   DARK MODE
========================= */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        if (
            document.body.classList.contains(
                "dark"
            )
        ) {

            themeBtn.textContent =
                "☀";

        }

        else {

            themeBtn.textContent =
                "☾";

        }

    }
);