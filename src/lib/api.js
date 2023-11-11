/**
 * API föll.
 * @see https://lldev.thespacedevs.com/2.2.0/swagger/
 */

/**
 * Sækjum týpurnar okkar.
 * @typedef {import('./api.types.js').Launch} Launch
 * @typedef {import('./api.types.js').LaunchDetail} LaunchDetail
 * @typedef {import('./api.types.js').LaunchSearchResults} LaunchSearchResults
 */

/** Grunnslóð á API (DEV útgáfa) */
const API_URL = 'https://lldev.thespacedevs.com/2.2.0/';

async function queryApi(url) {
  // await sleep(1000);
  try {
    const result = await fetch(url);

    if (!result.ok) {
      throw new Error('result not ok');
    }

    return await result.json();
  } catch (e) {
    console.warn('unable to query', e);
    return null;
  }
}

/**
 * Skilar Promise sem bíður í gefnar millisekúndur.
 * Gott til að prófa loading state, en einnig hægt að nota `throttle` í 
 * DevTools.
 * @param {number} ms Tími til að sofa í millisekúndum.
 * @returns {Promise<void>}
 */
export async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), ms);
  });
}

/**
 * Leita í geimskota API eftir leitarstreng.
 * @param {string} query Leitarstrengur.
 * @returns {Promise<Launch[] | null>} Fylki af geimskotum eða `null` ef villa
 *  kom upp.
 */
export async function searchLaunches(query) {
  const url = new URL('launch', API_URL);
  // console.log('searchlaunches: url:', url);
  url.searchParams.set('search', query);
  url.searchParams.set('mode', 'list');
  // console.log('url:', url);

  let response;
  try {
    response = await fetch(url);
    // console.log('response úr fetch:', response);
  } catch (e) {
    // console.error('Villa kom upp við að sækja gögn');
    return null;
  }

  if (!response.ok) {
    console.error(
      'Villa við að sækja gögn, ekki 200 staða',
      response.status,
      response.statusText
    );
    return null;
  }

  let json;
  try {
    json = await response.json();
    // console.log('json:', json);
  } catch (e) {
    console.error('Villa við að vinna úr JSON');
    return null;
  }

  return json.results;
}

/**
 * Skilar stöku geimskoti eftir auðkenni eða `null` ef ekkert fannst.
 * @param {string} id Auðkenni geimskots.
 * @returns {Promise<LaunchDetail | null>} Geimskot.
 */
export async function getLaunch(id) {
  // console.log('id:', id);
  const url = new URL(`launch/${id}`, API_URL);
  // console.log('url:', url);
  const result = await queryApi(url);
  // console.log('result:', result);

  if (!result) {
    return null;
  }

  return {
    id: result.key,
    name: result.name ?? '',
    window_start: result.window_start ?? '',
    window_end: result.window_end ?? '',
    status_name: result.status.name ?? '',
    status_description: result.status.description ?? '',
    mission_name: result.mission.name ?? '',
    mission_description: result.mission.description ?? '',
    image: result.image ?? '',
  };
}