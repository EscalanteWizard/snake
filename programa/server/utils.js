module.exports = {
  makeid,
}
/**
 * Crea un id de juego random
 * @param el largo deseado para el codigo del juego
 * @returns un id alfanumerico para identificar el juego
 * @restrictions los caracteres de salida son simbolos ascii
 */
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
