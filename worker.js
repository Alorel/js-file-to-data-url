/**
 * Message handler
 * @param {MessageEvent} e
 */
onmessage = function (e) {
    /**
     * Our data
     * @type {{
     *      file_list:FileList,
     *      download:Boolean
     * }}
     */
    var data = e.data,
        /**
         * @type {File}
         */
        fileToLoad = data.file_list[0],
        /**
         * @type FileReader
         */
        fileReader = new FileReader();


    fileReader.onload = function (fileLoadedEvent) {
        postMessage({
            type: "result",
            data: fileLoadedEvent.target.result,
            file_name: fileToLoad.name,
            download: data.download
        });
    };
    /**
     * Progress fn
     * @param {ProgressEvent} progress
     */
    fileReader.onprogress = function (progress) {
        postMessage({
            type: "progress",
            loaded: progress.loaded,
            total: progress.total
        });
    };

    fileReader.readAsDataURL(fileToLoad);
};