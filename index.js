(function () {
    'use strict';
    var status = document.getElementById("status"),
        allInputs = document.querySelectorAll("input:not(.btn-default)"),
        /**
         * Enable/disable inputs
         * @param {boolean} disabled True to disable, false to enable
         */
        inputsDisabled = function (disabled) {
            var i = 0,
                call, args;

            if (disabled) {
                call = HTMLElement.prototype.setAttribute;
                args = ["disabled", "true"];
            } else {
                call = HTMLElement.prototype.removeAttribute;
                args = ["disabled"];
            }

            for (; i < allInputs.length; i++) {
                call.apply(allInputs[i], args);
            }
        };

    if (typeof window.Worker === "undefined") {
        status.textContent = "Your browser does not support web workers! Please download Chrome or Firefox and try again";
        status.setAttribute("class", "alert alert-danger");

        inputsDisabled(true);
    } else {
        var inp_files = document.getElementById("inputFileToLoad"),
            progressbar = document.getElementById("progressbar"),
            /**
             * Our web worker
             * @type {Worker}
             */
            worker = new Worker("worker.js"),

            /**
             * Set our operation progress
             * @param {Number} loaded Number of bytes loaded
             * @param {Number} total Total number of bytes
             */
            setProgress = function (loaded, total) {
                var val = Math.round(loaded / total * 100);

                if (val == 100) {
                    progressbar.textContent = "100%";
                    progressbar.style.width = "100%";
                    progressbar.classList.remove("active");
                } else {
                    requestAnimationFrame(function () {
                        progressbar.textContent = val + "%";
                        progressbar.style.width = val + "%";
                    });
                }
            },

            /**
             * Download the file's contents
             * @param {String} filename The download filename
             * @param {String} text The file contents
             */
            download = function (filename, text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            },

            /**
             * Our loader function
             */
            loadImageFileAsURL = function () {
                inputsDisabled(true);
                progressbar.classList.add("active");
                setProgress(0, 1);
                status.textContent = "Working through the file. This might take a while if the file is large (and it might freeze your browser)";
                status.setAttribute("class", "alert alert-info");

                worker.postMessage({
                    file_list: inp_files.files,
                    download: document.querySelector("[name=mode]:checked").value === "dl"
                });
            };

        worker.onmessage = function (r) {
            if (r.data.type === "progress") {
                setProgress(r.data.loaded, r.data.total);
            } else {
                inputsDisabled(false);
                status.textContent = "Ready for work!";
                status.setAttribute("class", "alert alert-success");
                setProgress(1, 1);
                if (r.data.download) {
                    download(r.data.file_name + ".txt", r.data.data);
                } else {
                    window.open(r.data.data, "Result");
                }
            }
        };

        document.getElementById("go").addEventListener("click", loadImageFileAsURL);
    }
})();