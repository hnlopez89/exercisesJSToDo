/**
 * #########################################################################
 * ## Obtén todos los personajes cuya estatura sea igual o inferior a 160 ##
 * #########################################################################
 *
 * Api URL: https://www.swapi.tech/api/people
 *
 */

'use strict';

/**
 * ####################
 * ## queryApi(page) ##
 * ####################
 *
 * Realiza una petición y devuelve el objeto listo para ser usado.
 *
 * @param {String} page Api URL
 */

async function queryApi(page) {
  try {
    return await (await fetch(page)).json();
  } catch (error) {
    throw error;
  }
}

/**
 * ##############################
 * ## getBasicCharactersInfo() ##
 * ##############################
 *
 * Devuelve un array con información básica de todos los personajes.
 *
 */

async function getBasicCharactersInfo() {
  try {
    const content_1 = await queryApi('https://www.swapi.tech/api/people');

    let nextPage = content_1.next;

    const basicInfo = [...content_1.results];

    while (nextPage !== null) {
      try {
        const content_2 = await queryApi(nextPage);

        // Cambiamos la URL de la página siguiente. Cuando este valor sea null
        // el bucle while finalizará.
        nextPage = content_2.next;

        basicInfo.push(...content_2.results);
      } catch (error) {
        throw error;
      }
    }

    return basicInfo;
  } catch (error) {
    throw error;
  }
}

/**
 * #################################
 * ## getCompleteCharactersInfo() ##
 * #################################
 *
 * Devuelve un array con información detallada de todos los personajes.
 *
 * Aprovecho esa opción para hacer un filtrado (sin usar el método filter)
 * de los personajes cuya altura sea menor o igual a 160.
 *
 */

async function getCompleteCharactersInfo() {
  try {
    const basicInfo = await getBasicCharactersInfo();

    let completeCharacters = [];

    for (const character of basicInfo) {
      try {
        const content = await queryApi(character.url);

        if (parseInt(content.result.properties.height) <= 160) {
          // En este caso no usamos el spread operator porque
          // "properties" no es un array de objetos, es un objeto.
          completeCharacters.push(content.result);
        }
      } catch (error) {
        throw error;
      }
    }

    return completeCharacters;
  } catch (error) {
    throw error;
  }
}

getCompleteCharactersInfo().then(console.log);
