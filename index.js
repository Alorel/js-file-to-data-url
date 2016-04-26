(function ($) {
    'use strict';
    var $status = $("#status"),

        $inputsAndTextareas = $("input,textarea");

    if (!window.Worker) {
        $status.text("Your browser does not support web workers! Please download Chrome or Firefox and try again")
            .attr("class", "alert alert-danger");
        $inputsAndTextareas.prop("disabled", true);
    } else {
        var $inp_files = $("#inputFileToLoad"),
            $inp_contents = $("#textAreaFileContents"),
            $progressbar = $("#progressbar"),
            $mode = $("input[name=mode]"),
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
                $progressbar.css("width", val + "%").text(val + "%");

                if (val == 100) {
                    $progressbar.removeClass("active");
                } else {
                    $progressbar.addClass("active");
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
                $inputsAndTextareas.prop("disabled", false);
                setProgress(0, 1);
                $status.text("Working through the file. This might take a while if the file is large (and it might freeze your browser)")
                    .attr("class", "alert alert-info");
                worker.postMessage({
                    file_list: $inp_files[0].files,
                    download: $mode.filter(":checked").val() === "dl"
                });
                $inp_contents.val("");
            };

        worker.onmessage = function (r) {
            if (r.data.type === "progress") {
                setProgress(r.data.loaded, r.data.total);
            } else {
                $inputsAndTextareas.prop("disabled", false);
                $status.text("Ready for work!")
                    .attr("class", "alert alert-success");
                setProgress(1, 1);
                if (r.data.download) {
                    download(r.data.file_name + ".txt", r.data.data);
                } else {
                    $inp_contents.val(r.data.data).focus().select();
                }
            }
        };

        $("#src-tag").val(document.documentElement.outerHTML)
            .css({
                'white-space': 'pre',
                'font-family': 'Menlo,Monaco,Consolas,"Courier New",monospace'
            })
            .attr("rows", document.documentElement.outerHTML.split("\n").length + 1)
            .click(function () {
                $(this).select();
            });

        $inp_files.change(loadImageFileAsURL);
    }
})(jQuery);