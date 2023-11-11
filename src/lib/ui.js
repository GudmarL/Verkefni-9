import { getLaunch, searchLaunches } from './api.js';
import { el } from './elements.js';

/**
 * Býr til leitarform.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarstrengur.
 * @returns {HTMLElement} Leitarform.
 */
export function renderSearchForm(searchHandler, query = undefined) {
  // const form = el('form', {}, el('input', { type: 'text', name: 'query', value: query ?? '' }), el('button', {}, 'Leita'));
  const form = el('form', {}, 
    el('input' , {value: query ?? '', placeholder: 'Leitarorð' }), 
    el('button', {}, 'Leita'));
  form.addEventListener('submit', searchHandler);
  return form;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera óvirkt.
 */
function setLoading(parentElement, searchForm = undefined) {
  let loadingElement = parentElement.querySelector('.loading');

  if (!loadingElement) {
    loadingElement = el('div', { class: 'loading' }, 'Sæki gögn...');
    parentElement.appendChild(loadingElement);
  }

  if (!searchForm) {
    return;
  }

  const button = searchForm.querySelector('button');

  if (button) {
    button.setAttribute('disabled', 'disabled');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement} parentElement Element sem inniheldur skilaboð.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt.
 */
function setNotLoading(parentElement, searchForm = undefined) {
  const loadingElement = parentElement.querySelector('.loading');

  if (loadingElement) {
    loadingElement.remove();
  }

  if (!searchForm) {
    return;
  }

  const disabledButton = searchForm.querySelector('button[disabled]');

  if (disabledButton) {
    disabledButton.removeAttribute('disabled');
  }
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  const list = el('ul', {class : 'results'});
  list.appendChild(el('h2', { class: 'results__title' }, `Leitarniðurstöður fyrir: "${query}"`));

  if (!results) {
    const noResultElement = el('li', {}, `Villa við leit að ${query}`);
    list.appendChild(noResultElement);
    return list;
  }

  if (results.length === 0) {
    const noResultElement = el('li', {}, `Engar niðurstöður fyrir leit að ${query}`);
    list.appendChild(noResultElement);
    return list;
  }

  for (const result of results) {
    const resultElement = el('li',{class: 'result'}, 
      el('span', {class: 'name' }, el('a',{href: `/?id=${result.id}`}, result.name)),
      el('span', {class: 'mission'}, el('h3',{},'Geimferð: '), result.mission),
    );
    list.appendChild(resultElement);
  }

  return list;
}

/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query) {
  const mainElement = parentElement.querySelector('main');

  if (!mainElement) {
    console.warn('fann ekki <main> element');
    return;
  }
  
  // Fjarlægja fyrri niðurstöður
  const resultsElement = mainElement.querySelector('.results');
  if (resultsElement) {
    resultsElement.remove();
  }

  setLoading(mainElement, searchForm);
  const results = await searchLaunches(query);
  setNotLoading(mainElement, searchForm);

  const resultsEl = createSearchResults(results, query);

  mainElement.appendChild(resultsEl);
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderFrontpage(
  parentElement,
  searchHandler,
  query = undefined,
) {
  const heading = el('h1', { class: 'heading', 'data-foo' : 'bar'}, 'Geimskotaleitin 🚀');
  const searchForm = renderSearchForm(searchHandler, query);
  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (!query) {
    return;
  }

  searchAndRender(parentElement, searchForm, query);
}


/**
 * Útbýr element fyrir öll gögn um bók. Birtir titil fyrir þau gögn sem eru til
 * staðar (ekki tóm fylki) og birtir þau.
 * @param {object} launch Gögn fyrir bók sem á að birta.
 * @returns Element sem inniheldur öll gögn um bók.
 */
export function createLaunch(launch) {
  const launchEl = el('div', { class: 'launch-site' }, 
    el('h1', { class: 'launch-title' }, launch.name));
  launchEl.appendChild(el('p', { class: 'window-start' }, `Gluggi opnast: ${launch.window_start}`));
  launchEl.appendChild(el('p', { class: 'window-end' }, `Gluggi lokast: ${launch.window_end}`));
  launchEl.appendChild(el('h2', { class: 'status' }, `Staða: ${launch.status_name}`));
  launchEl.appendChild(el('p', { class: 'status-description' }, launch.status_description));
  launchEl.appendChild(el('h2', { class: 'mission-name' }, `Geimferð: ${launch.mission_name}`));
  launchEl.appendChild(el('p', { class: 'mission-description' }, launch.mission_description));

  if (launch.image) {
    launchEl.appendChild(el('img', { class: 'launch-image', src: launch.image }));
  }

  launchEl.appendChild(el('p', { class: 'go-back' }, el('a', { href: '/' }, 'Til baka')));

  return launchEl;
}

/**
 * Sýna geimskot.
 * @param {HTMLElement} parentElement Element sem á að innihalda geimskot.
 * @param {string} id Auðkenni geimskots.
 */
export async function renderDetails(parentElement, id) {
  const container = el('main', {});

  parentElement.appendChild(container);

  /* Setja loading state og sækja gögn */
  setLoading(parentElement);
  const result = await getLaunch(id);
  setNotLoading(parentElement);

  // Tómt og villu state, við gerum ekki greinarmun á þessu tvennu, ef við
  // myndum vilja gera það þyrftum við að skilgreina stöðu fyrir niðurstöðu
  if (!result) {
    parentElement.appendChild(el('p', {}, 'Ekkert geimskot fannst.'));
    return;
  }

  /* Útfæra ef gögn */
  parentElement.appendChild(createLaunch(result));

}