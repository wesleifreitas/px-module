angular.module('px-string-util', [])
    .factory('pxStringUtil', pxStringUtil);

pxStringUtil.$inject = [];

function pxStringUtil() {

    var service = {};

    service.pad = pad;
    service.toBinary = toBinary;

    return service;

    /**
     * Preencher string
     * Note que é utizado o parâmetro pré-preenchimento (pad) devido a perfomance
     * Mais detalhes em http://jsperf.com/string-padding-performance
     * @param  {String}  pad     pré-preenchimento, exemplo '0000000000'
     * @param  {String}  str     string que será preenchida
     * @param  {Boolean} padLeft preencher à esquerda?
     * @return {String}          string preenchida
     */
    function pad(pad, str, padLeft) {
        if (typeof str === 'undefined')
            return pad;
        if (padLeft) {
            return (pad + str).slice(-pad.length);
        } else {
            return (str + pad).substring(0, pad.length);
        }
    }

    /**
     * Calcular a representação binária dos dados codificados em Base64 ou de um documento PDF.
     * @param  {String} data        [description]
     * @param  {String} contentType [description]
     * @param  {Number} sliceSize   [description]
     * @return {String}             Representação binária dos dados .
     */
    function toBinary(data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    }
}