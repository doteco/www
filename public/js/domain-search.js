window.domainSearch = function (config) {
  'use strict'

  function registrarLogoDiv (registrar, domain) {
    const goUrl = config.searchUrl + '/go?registrar=' + encodeURIComponent(registrar.registrar) + '&domain=' + encodeURIComponent(domain)
    return '<div class="col-md-6 col-lg-4 registrar-button"><a data-registrar="' + registrar.registrar + '" href="' + goUrl + '" rel="noopener" class="registrar-link"><img src="https://cdn.profiles.eco/registrars/logos/' + registrar.logo + '" alt="' + registrar.label + '" class="registrar-logo" /></a></div>'
  }

  function generateFilterHtml (id, defaultItem, items) {
    const options = items.map(item => `<option value="${item}">${item}</option>`)
    return `<div class="col-sm-3"><select id="${id}" class="custom-select registrar-filter"><option value="" selected>${defaultItem}</option>${options}</select></div>`
  }

  function searchDomain () {
    return document.querySelector('.domain-search').value
  }

  function uniqueFilterItems (registrars, field) {
    const itemsAll = registrars.map(registrar => {
      return registrar[field]
    })
    const itemsUnique = Array.from(new Set(itemsAll.flat())).filter(item => item.length > 0)
    itemsUnique.sort()
    return itemsUnique
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
      filteredRegistrars = filteredRegistrars.filter(registrar => registrar.envPolicy.length > 0)
    }
    showAllRegistrars(filteredRegistrars, searchDomain())
  }

  function addFilters (registrars) {
    const registrarsFilterRow = document.querySelector('.registrars-filter')
    registrarsFilterRow.innerHTML = ''

    const languages = uniqueFilterItems(registrars, 'languages')
    const currencies = uniqueFilterItems(registrars, 'currencies')
    const regions = uniqueFilterItems(registrars, 'region')
    const envPolicy = ['Yes']

    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-policy', 'Environmental policy', envPolicy))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-currency', 'Currency', currencies))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-language', 'Language', languages))
    registrarsFilterRow.insertAdjacentHTML('afterbegin', generateFilterHtml('filter-region', 'Region', regions))

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

  function showRegistrars (registrars, domain) {
    const priorityRegistrars = registrars.filter(registrar => registrar.priority)
    priorityRegistrars.sort((registrar1, registrar2) => registrar2.priority - registrar1.priority)

    document.querySelectorAll('.registrars').forEach(el => {
      registrars.length ? el.removeAttribute('hidden') : el.setAttribute('hidden', '')
    })
    const priorityRegistrarsRow = document.querySelector('.registrars-priority .row')
    priorityRegistrarsRow.innerHTML = ''
    priorityRegistrars.forEach(registrar => {
      priorityRegistrarsRow.insertAdjacentHTML('afterbegin', registrarLogoDiv(registrar, domain))
    })
    showAllRegistrars(registrars, domain)
  }

  function searchResultMessage (r, searchDomain) {
    if (!r.domain) {
      return `We cannot find <span class="searched-domain">${searchDomain}</span>. Please try a different .eco name`
    }
    if (r.summary === 'inactive' || r.summary === 'premium') {
      return `<span class="searched-domain">${searchDomain}</span> is available`
    }
    return `<span class="searched-domain">${searchDomain}</span> is already taken.<br/>Please try a different .eco name`
  }

  function search (domain) {
    if (!domain || domain.trim().length === 0 || domain.trim() === '.eco') {
      return false
    }
    config.onSearch(domain)
    return window.fetch(config.searchUrl + '/status?domain=' + domain).then(response => {
      if (!response.ok) {
        console.error(`Failed to load search data: ${response.statusText}`)
        document.querySelector('.search-results').innerHTML = 'Error searching for domain name. Please try again later.'
      }

      return response.json().then(r => {
        console.log('search result:', r)
        if (r.domain) {
          document.querySelector('.domain-search').value = r.domain
        }

        const searchResultsRow = document.querySelector('.search-results')
        const message = searchResultMessage(r, searchDomain())
        searchResultsRow.innerHTML = `<span class='domain-search-output title'>${message}</span>`

        const registrars = r.registrars || []
        showRegistrars(registrars, r.domain)
        addFilters(registrars)
      })
    }).catch(ex => {
      console.error(`Failed to load search data: ${ex}`)
      document.querySelector('.search-results').innerHTML = 'Error searching for domain name. Please try again later.'
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

  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('domain')) {
    const domain = urlParams.get('domain')
    console.log('searching for', domain)
    search(domain)
  }
}
