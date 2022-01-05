window.domainSearch = function (config) {
  'use strict'

  function registrarLogoDiv (registrar, domain) {
    const goUrl = config.searchUrl + '/go?registrar=' + encodeURIComponent(registrar.registrar) + '&domain=' + encodeURIComponent(domain)
    return `<div class="col-md-6 col-lg-4 registrar-button"><a data-registrar="${registrar.registrar}" href="${goUrl}" rel="noopener" class="registrar-link"><img src="https://cdn.profiles.eco/registrars/logos/${registrar.logo}" alt="${registrar.label}" class="registrar-logo" /><span class="registrar-name">${registrar.label}</span></a></div>`
  }

  function generateFilterHtml (id, defaultItem, items, defaultValue) {
    const options = items.map(item => `<option value="${item.value}"${item.value === defaultValue ? 'selected' : ''}>${item.label}</option>`)
    return `<div class="col-sm-3"><select id="${id}" class="custom-select registrar-filter"><option value="" selected>${defaultItem}</option>${options}</select></div>`
  }

  function searchDomain () {
    return document.querySelector('.domain-search').value
  }

  function uniqueFilterItems (registrars, field, labels = {}) {
    const itemsAll = registrars.map(registrar => {
      return registrar[field]
    })
    const itemsUnique = Array.from(new Set(itemsAll.flat())).filter(item => item.length > 0)
    itemsUnique.sort()
    return itemsUnique.map(item => ({ value: item, label: labels[item] || item }))
  }

  function filterRegistrars (registrars) {
    const policyFilter = document.querySelector('#filter-policy').value
    const currencyFilter = document.querySelector('#filter-currency').value
    const languageFilter = document.querySelector('#filter-language').value
    const regionFilter = document.querySelector('#filter-region').value
    console.log('Filters:', regionFilter, languageFilter, currencyFilter, policyFilter)
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
    showAllRegistrars(filteredRegistrars, searchDomain())
    config.onFilter([regionFilter, languageFilter, currencyFilter, policyFilter])
  }

  function addFilters (registrars) {
    const registrarsFilterRow = document.querySelector('.registrars-filter')
    registrarsFilterRow.innerHTML = ''

    const languages = uniqueFilterItems(registrars, 'languages')
    const currencies = uniqueFilterItems(registrars, 'currencies')
    const regions = uniqueFilterItems(registrars, 'region', config.regionLabels)
    const envPolicy = [{ value: 'Yes', label: config.envPolicyLabels.Yes }]

    const { filterLabels, filterDefaults } = config
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-region', filterLabels.region, regions, filterDefaults.region))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-policy', filterLabels.envPolicy, envPolicy, filterDefaults.envPolicy))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-language', filterLabels.language, languages, filterDefaults.language))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-currency', filterLabels.currency, currencies, filterDefaults.currency))

    document.querySelectorAll('.registrar-filter').forEach(el => el.addEventListener('change', () => filterRegistrars(registrars)))
  }

  function showAllRegistrars (registrars, domain) {
    const registrarsRow = document.querySelector('.registrars-all .registrars-row')
    registrarsRow.innerHTML = ''
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
    const priorityRegistrars = registrars.filter(registrar => registrar.priority)
    priorityRegistrars.sort((registrar1, registrar2) => registrar2.priority - registrar1.priority)

    document.querySelectorAll('.registrars').forEach(el => toggleVisibility(el, registrars.length))

    const priorityRegistrarsRow = document.querySelector('.registrars-priority .row')
    priorityRegistrarsRow.innerHTML = ''
    priorityRegistrars.forEach(registrar => {
      priorityRegistrarsRow.insertAdjacentHTML('afterbegin', registrarLogoDiv(registrar, domain))
    })
    showAllRegistrars(registrars, domain)
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
    return resultLabel.replace('{searchDomain}', searchDomain)
  }

  function search (domain) {
    if (!domain || domain.trim().length === 0 || domain.trim() === '.eco') {
      return false
    }
    domain = domain.replace(/\..*$/, '').replace(/\s/, '')
    domain += '.eco'

    const searchResultsRow = document.querySelector('.search-results')
    config.onSearch(domain)
    // return window.fetch(config.searchUrl + '/status?engine=cira&domain=' + domain).then(response => {
    return window.fetch(config.searchUrl + '/status?domain=' + domain).then(response => {
      if (!response.ok) {
        console.error(`Failed to load search data: ${response.statusText}`)
        searchResultsRow.innerHTML = config.resultLabels.error
      }

      return response.json().then(r => {
        console.log('search result:', r)
        if (r.domain) {
          document.querySelector('.domain-search').value = r.domain
        }

        const message = searchResultMessage(r, searchDomain())
        searchResultsRow.innerHTML = `<span class='domain-search-output title'>${message}</span>`

        const registrars = r.registrars || []
        showRegistrars(registrars, r.domain)
        addFilters(registrars)
        toggleReservedForm(r.summary === 'reserved' || r.status === 'blocked', r.domain)
      })
    }).catch(ex => {
      console.error(`Failed to load search data: ${ex}`)
      console.error(ex)
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

  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('domain')) {
    const domain = urlParams.get('domain')
    search(domain)
  }
}

window.fetchRegistrars = function (config) {
  return window.fetch(config.searchUrl + '/registrars').then(response => response.json())
}
