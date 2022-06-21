window.domainSearch = function (config) {
  'use strict'

  function registrarLogoDiv (registrar, domain) {
    const goUrl = config.searchUrl + '/go?registrar=' + encodeURIComponent(registrar.registrar) + (domain ? '&domain=' + encodeURIComponent(domain) : '')
    const greenLabel = registrar.envPolicy ? `<span class="registrar-green" title="${config.filterLabels.envPolicy}">&#x1F33F</span>` : ''
    return `<div class="col-md-6 col-lg-4 registrar-button"><a data-registrar="${registrar.registrar}" href="${goUrl}" rel="noopener" class="registrar-link"><img src="https://cdn.profiles.eco/registrars/logos/${registrar.logo}" alt="${registrar.label}" class="registrar-logo" /><span class="registrar-name">${registrar.label}</span></a>${greenLabel}</div>`
  }

  function generateFilterHtml (id, defaultItem, items, defaultValue, helpText) {
    const options = items.map(item => `<option value="${item.value}"${item.value === defaultValue ? 'selected' : ''}>${item.label}</option>`)
    return `<div class="col-sm-3 registrar-filter"><label for="${id}" title="${helpText}">${defaultItem}</label><select id="${id}" name="${id}" class="custom-select registrar-select" title="${helpText}"><option value="" selected>---</option>${options}</select></div>`
  }

  function searchDomain () {
    return document.querySelector('.domain-search').value
  }

  function uniqueFilterItems (registrars, field, labels = {}) {
    const itemsAll = registrars.reduce((arr, registrar) => {
      registrar[field].forEach(v => (arr.push(v)))
      return arr
    }, [])
    const itemsUnique = Array.from(new Set(itemsAll)).filter(item => item.length > 0)
    itemsUnique.sort((a, b) => a.localeCompare(b))
    return itemsUnique.map(item => ({ value: item, label: labels[item] || item }))
  }

  function changeFilter (registrars) {
    const filters = getFilterValues()
    console.log('Filters:', filters)
    config.onFilter(filters)

    const filteredRegistrars = filterRegistrars(registrars, filters)
    showAllRegistrars(filteredRegistrars, searchDomain())
  }

  function getFilterValues () {
    const policyFilter = document.querySelector('#filter-policy').value
    const currencyFilter = document.querySelector('#filter-currency').value
    const languageFilter = document.querySelector('#filter-language').value
    const regionFilter = document.querySelector('#filter-region').value
    return [regionFilter, languageFilter, currencyFilter, policyFilter]
  }

  function filterRegistrars (registrars, filters) {
    const [regionFilter, languageFilter, currencyFilter, policyFilter] = filters

    let filteredRegistrars = registrars
    if (regionFilter.length > 0) {
      filteredRegistrars = filteredRegistrars.filter(registrar => registrar.region.includes(regionFilter))
    }
    if (languageFilter.length > 0) {
      filteredRegistrars = filteredRegistrars.filter(registrar => registrar.languages.includes(languageFilter))
    }
    if (currencyFilter.length > 0) {
      filteredRegistrars = filteredRegistrars.filter(registrar => registrar.currencies.includes(currencyFilter))
    }
    if (policyFilter.length > 0) {
      filteredRegistrars = filteredRegistrars.filter(registrar => registrar.envPolicy)
    }
    return filteredRegistrars
  }

  function getFilterDefault (filter) {
    const defaultFilter = getUriParam(filter)
    return defaultFilter || config.filterDefaults[filter]
  }

  function addFilters (registrars) {
    const registrarsFilterRow = document.querySelector('.registrars-filter')
    registrarsFilterRow.innerHTML = config.filterLabels.greenRetailers

    const languages = uniqueFilterItems(registrars, 'languages')
    const currencies = uniqueFilterItems(registrars, 'currencies')
    const regions = uniqueFilterItems(registrars, 'region', config.regionLabels)
    const envPolicy = [{ value: 'Yes', label: config.envPolicyLabels.Yes }]

    const filterLabels = config.filterLabels
    const filterHelp = config.filterHelp
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-region', filterLabels.region, regions, getFilterDefault('region'), filterHelp.region))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-policy', filterLabels.envPolicy, envPolicy, getFilterDefault('envPolicy'), filterHelp.envPolicy))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-language', filterLabels.language, languages, getFilterDefault('language'), filterHelp.language))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-currency', filterLabels.currency, currencies, getFilterDefault('currency'), filterHelp.currency))

    document.querySelectorAll('.registrar-filter').forEach(el => el.addEventListener('change', () => changeFilter(registrars)))
  }

  function showAllRegistrars (registrars, domain) {
    const registrarsRow = document.querySelector('.registrars-all .registrars-row')
    registrarsRow.innerHTML = ''
    if (!registrars.length) {
      registrarsRow.innerHTML = config.filterLabels.noRegistrars
      return
    }
    registrars.sort((registrar1, registrar2) => registrar2.label.localeCompare(registrar1.label))
    registrars.forEach(registrar => {
      registrarsRow.insertAdjacentHTML('afterbegin', registrarLogoDiv(registrar, domain))
    })
    document.querySelectorAll('.registrar-link').forEach(el => {
      el.addEventListener('click', () => config.onClick(el.dataset.registrar, el.href))
    })
  }

  function toggleVisibility (el, isVisible) {
    isVisible ? el.removeAttribute('hidden') : el.setAttribute('hidden', '')
  }

  function showRegistrars (registrars, domain) {
    const filters = getFilterValues()
    let priorityRegistrars = filterRegistrars(registrars.filter(registrar => registrar.priority), filters)
    priorityRegistrars.sort((registrar1, registrar2) => registrar1.priority - registrar2.priority)
    priorityRegistrars = priorityRegistrars.slice(0, 6)

    document.querySelectorAll('.registrars').forEach(el => toggleVisibility(el, registrars.length))

    const priorityRegistrarsRow = document.querySelector('.registrars-priority .row')
    priorityRegistrarsRow.innerHTML = ''
    priorityRegistrars.forEach(registrar => {
      priorityRegistrarsRow.insertAdjacentHTML('beforeend', registrarLogoDiv(registrar, domain))
    })
    const filteredRegistrars = filterRegistrars(registrars, filters)
    showAllRegistrars(filteredRegistrars, domain)
  }

  function toggleReservedForm (isReserved, domain) {
    const reservedForm = document.querySelector('.domain-reserved')
    toggleVisibility(reservedForm, isReserved)
    if (isReserved) {
      toggleVisibility(document.querySelector('.submit-thanks'), false)
      document.getElementById('makeoffer-domain').value = domain
    }
  }

  function searchResultMessage (r, searchDomain) {
    let resultLabel = config.resultLabels.unavailable
    if (!r.domain || r.summary === 'disallowed' || r.summary === 'invalid') {
      resultLabel = config.resultLabels.invalid
    } else if (r.summary === 'inactive' || r.summary === 'premium' || r.status === 'available') {
      resultLabel = config.resultLabels.available
    } else if (r.summary === 'reserved' || r.status === 'blocked') {
      resultLabel = config.resultLabels.reserved
    }
    return resultLabel.replace(/{searchDomain}/g, searchDomain)
  }

  function fetchSearchResults (domain, engine) {
    return window.fetch(config.searchUrl + '/status?engine=' + engine + (domain ? '&domain=' + domain : ''))
  }

  function search (domain) {
    if (!domain || domain.trim().length === 0 || domain.trim() === '.eco') {
      return false
    }
    domain = domain.replace(/[\s;<>"'\/=()]/g, '').replace(/\..*$/, '')
    domain += '.eco'

    const searchResultsRow = document.querySelector('.search-results')
    config.onSearch(domain)
    return fetchSearchResults(domain, config.searchEngine).then(response => {
      if (!response.ok) {
        const errorMessage = 'Failed to load search data: ' + response.statusText
        console.error(errorMessage)
        window.Sentry && window.Sentry.captureException(new Error(errorMessage))
        searchResultsRow.innerHTML = config.resultLabels.error
      }

      return response.json().then(r => {
        console.log('search result:', r)
        if (r.domain) {
          document.querySelector('.domain-search').value = r.domain
        }

        const message = searchResultMessage(r, r.domain || domain)
        searchResultsRow.innerHTML = `<span class='domain-search-output title'>${message}</span>`

        const registrars = r.registrars || []
        addFilters(registrars)
        showRegistrars(registrars, r.domain)
        toggleReservedForm(r.summary === 'reserved' || r.status === 'blocked', r.domain)
      })
    }).catch(ex => {
      console.error('Failed to load search data: ' + ex)
      console.error(ex)
      window.Sentry && window.Sentry.captureException(ex, {
        extra: {
          ctx: 'Failed to fetch search data'
        }
      })
      searchResultsRow.innerHTML = config.resultLabels.error
    })
  }

  document.querySelector('.btn-search').addEventListener('click', function (e) {
    e.preventDefault()
    return search(searchDomain())
  })

  document.querySelector('.domain-search').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      return search(searchDomain())
    }
  })

  document.querySelector('.iframe-form-iframe').addEventListener('load', function (e) {
    document.querySelector('.submit-application').disabled = true
    toggleVisibility(document.querySelector('.submit-thanks'), true)
  })

  document.querySelector('.submit-application').addEventListener('submit', function (e) {
    config.onReservedSubmit(searchDomain())
  })

  function getUriParam (param) {
    if ('URLSearchParams' in window) {
      return new URLSearchParams(window.location.search).get(param)
    }
  }

  const domain = getUriParam('domain')
  if (domain) {
    search(domain)
  } else {
    fetchSearchResults(null, config.searchEngine).then(response => response.json()).then(result => {
      const registrars = result.registrars
      addFilters(registrars)
      showRegistrars(registrars)
    })
  }
}

window.fetchRegistrars = function (config) {
  return window.fetch(config.searchUrl + '/registrars').then(response => response.json())
}
