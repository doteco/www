window.domainSearch = function (config) {
  'use strict'

  const ecoAttributeLabels = {
    'Powered by renewable energy': `<span title="${config.envPolicyLabels['Powered by renewable energy']}">&#x2600;&#xFE0E;</span>`,
    'Energy efficient data center': `<span title="${config.envPolicyLabels['Energy efficient data center']}">&#x26A1;&#xFE0E;</span>`,
    'E-waste recycling': `<span title="${config.envPolicyLabels['E-waste recycling']}">&#x267A;&#xFE0E;</span>`,
    'Passes Green Web Check': `<span title="${config.envPolicyLabels['Passes Green Web Check']}">&#x2714;&#xFE0E;</span>`
  }

  function ecoAttributesLabel (registrar) {
    if (!registrar.ecoAttributes) return ''
    const ecoAttributes = registrar.ecoAttributes.map(function (a) {
      return ecoAttributeLabels[a] || ''
    })
    return `<span class="registrar-green">${ecoAttributes.join(' ')}</span`
  }

  function registrarLogoDiv (registrar, domain, languageFilter) {
    const goUrl = config.searchUrl + '/go?registrar=' + encodeURIComponent(registrar.registrar) + (domain ? '&domain=' + encodeURIComponent(domain) : '') + (languageFilter ? '&lang=' + encodeURIComponent(languageFilter) : '')
    const greenLabel = ecoAttributesLabel(registrar)
    return `<div class="col-md-6 col-lg-4 registrar-button registrar-${registrar.registrar}"><a data-registrar="${registrar.registrar}" href="${goUrl}" rel="noopener" class="registrar-link" title="${config.registerLabel.replace('%s', registrar.label)}"><img src="https://cdn.profiles.eco/registrars/logos/${registrar.logo}" alt="" class="registrar-logo" loading="lazy" /><span class="registrar-name">${registrar.label}</span></a>${greenLabel}</div>`
  }

  function generateFilterHtml (id, defaultItem, items, defaultValue, helpText) {
    const options = items.map(item => `<option value="${item.value}"${item.value === defaultValue ? 'selected' : ''}>${item.label}</option>`)
    return `<div class="col-md-3 registrar-filter"><label for="${id}" title="${helpText}">${defaultItem}</label><select id="${id}" name="${id}" class="custom-select registrar-select" title="${helpText}"><option value="" selected>---</option>${options}</select></div>`
  }

  function searchDomain () {
    return document.querySelector('.domain-search').value
  }

  function uniqueFilterItems (registrars, field, labels = {}) {
    const itemsAll = registrars.reduce((arr, registrar) => {
      registrar[field]?.forEach(v => (arr.push(v)))
      return arr
    }, [])
    const itemsUnique = Array.from(new Set(itemsAll)).filter(item => item.length > 0)
    const items = itemsUnique.map(item => ({ value: item, label: labels[item] || item }))
    items.sort((a, b) => a.label.localeCompare(b.label, { ignorePunctuation: true }))
    return items
  }

  function changeFilter (registrars) {
    const filters = getFilterValues()
    config.onFilter(filters)
    const domain = searchDomain()
    updateUriHistory(domain, filters)

    showAllRegistrars(registrars, domain, filters)
  }

  function getFilterValue (filterId) {
    const filterElement = document.getElementById(filterId)
    return filterElement && filterElement.value
  }

  function getFilterValues () {
    const policyFilter = getFilterValue('filter-policy')
    const currencyFilter = getFilterValue('filter-currency')
    const languageFilter = getFilterValue('filter-language')
    const regionFilter = getFilterValue('filter-region')
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
      if (policyFilter === 'Yes') {
        filteredRegistrars = filteredRegistrars.filter(registrar => registrar.envPolicy)
      } else {
        filteredRegistrars = filteredRegistrars.filter(registrar => registrar.ecoAttributes?.includes(policyFilter))
      }
    }
    return filteredRegistrars
  }

  function getFilterDefault (filter) {
    const defaultFilter = getUriParam(filter)
    return defaultFilter || config.filterDefaults[filter]
  }

  function addFilters (registrars) {
    const registrarsFilterRow = document.querySelector('.registrars-filter-row')

    const languages = uniqueFilterItems(registrars, 'languages')
    const currencies = uniqueFilterItems(registrars, 'currencies')
    const regions = uniqueFilterItems(registrars, 'region', config.regionLabels)
    const envPolicy = uniqueFilterItems(registrars, 'ecoAttributes', config.envPolicyLabels)
    envPolicy.unshift({ value: 'Yes', label: config.envPolicyLabels.Yes })

    const filterLabels = config.filterLabels
    const filterHelp = config.filterHelp
    registrarsFilterRow.innerHTML = [
      generateFilterHtml('filter-policy', filterLabels.envPolicy, envPolicy, getFilterDefault('envPolicy'), filterHelp.envPolicy),
      generateFilterHtml('filter-currency', filterLabels.currency, currencies, getFilterDefault('currency'), filterHelp.currency),
      generateFilterHtml('filter-language', filterLabels.language, languages, getFilterDefault('language'), filterHelp.language),
      generateFilterHtml('filter-region', filterLabels.region, regions, getFilterDefault('region'), filterHelp.region)
    ].join('')

    document.querySelectorAll('.registrar-filter').forEach(el => el.addEventListener('change', () => changeFilter(registrars)))
  }

  function showAllRegistrars (registrars, domain, filters) {
    const filteredRegistrars = filterRegistrars(registrars, filters)
    const languageFilter = filters[1]

    toggleVisibility(document.querySelector('.registrars-all'), registrars.length)
    const registrarsRow = document.querySelector('.registrars-all .registrars-row')
    registrarsRow.innerHTML = ''
    if (!filteredRegistrars.length) {
      registrarsRow.innerHTML = config.filterLabels.noRegistrars
      return
    }
    filteredRegistrars.sort((registrar1, registrar2) => registrar2.label.localeCompare(registrar1.label))
    filteredRegistrars.forEach(registrar => {
      registrarsRow.insertAdjacentHTML('afterbegin', registrarLogoDiv(registrar, domain, languageFilter))
    })
    document.querySelectorAll('.registrar-link').forEach(el => {
      el.addEventListener('click', () => config.onClick(el.dataset.registrar, el.href))
    })
  }

  function toggleVisibility (el, isVisible) {
    isVisible ? el.removeAttribute('hidden') : el.setAttribute('hidden', '')
  }

  function showRegistrars (registrars, domain) {
    const selectedRegistrar = getUriParam('registrar')
    if (selectedRegistrar) {
      const registrar = registrars.find(registrar => registrar.registrar === selectedRegistrar)
      if (registrar) {
        toggleVisibility(document.querySelector('.registrars-priority'), !!registrar)
        const priorityRegistrarsRow = document.querySelector('.registrars-priority .registrars-row')
        priorityRegistrarsRow.innerHTML = ''
        priorityRegistrarsRow.insertAdjacentHTML('beforeend', registrarLogoDiv(registrar, domain))
        return
      }
    }

    const filters = getFilterValues()
    const languageFilter = filters[1]
    let priorityRegistrars = filterRegistrars(registrars.filter(registrar => registrar.priority), filters)
    priorityRegistrars.sort((registrar1, registrar2) => registrar1.priority - registrar2.priority)
    priorityRegistrars = priorityRegistrars.slice(0, 6)

    toggleVisibility(document.querySelector('.registrars-priority'), priorityRegistrars.length)
    const priorityRegistrarsRow = document.querySelector('.registrars-priority .registrars-row')
    priorityRegistrarsRow.innerHTML = ''
    priorityRegistrars.forEach(registrar => {
      priorityRegistrarsRow.insertAdjacentHTML('beforeend', registrarLogoDiv(registrar, domain, languageFilter))
    })

    showAllRegistrars(registrars, domain, filters)
  }

  function toggleReservedForm (isReserved, domain) {
    const reservedForm = document.querySelector('.domain-reserved')
    toggleVisibility(document.querySelector('.submit-form'), true)
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
    } else if (r.summary === 'inactive') {
      resultLabel = config.resultLabels.available
    } else if (r.summary === 'premium') {
      resultLabel = config.resultLabels.premium
    } else if (r.summary === 'reserved') {
      resultLabel = config.resultLabels.reserved
    } else if (r.summary === 'undelegated') {
      resultLabel = config.resultLabels.error
    }
    return resultLabel.replace(/{searchDomain}/g, searchDomain)
  }

  function fetchSearchResults (domain, engine) {
    const searchUrl = new URL('status', config.searchUrl)
    if (engine) {
      searchUrl.searchParams.set('engine', engine)
    }
    if (domain) {
      searchUrl.searchParams.set('domain', domain)
    }
    return window.fetch(searchUrl)
  }

  function handleSearchError (ex) {
    console.error('Failed to load search data: ' + ex)
    console.error(ex)
    window.Sentry && window.Sentry.captureException(ex, {
      extra: {
        ctx: 'Failed to fetch search data'
      }
    })
    const searchResultsRow = document.querySelector('.search-results')
    searchResultsRow.innerHTML = `<span class='domain-search-output title'>${config.resultLabels.error}</span>`

    const searchResultsSection = document.querySelector('.search-results-section')
    toggleVisibility(searchResultsSection, true)
  }

  function search (domain) {
    const hasDomain = domain && domain.trim().length > 0 && domain.trim() !== '.eco'
    if (hasDomain) {
      const cleanseRegex = /[\s!"#$%&'()*+,/:;<=>?@\[\]\\^_`]/g // eslint-disable-line no-useless-escape
      domain = domain.replace(cleanseRegex, '').replace(/\..*$/, '') + '.eco'
    } else {
      domain = null
    }

    const searchBox = document.querySelector('.domain-search')
    searchBox.value = domain

    if (domain) {
      config.onSearch(domain)
    }
    return fetchSearchResults(domain, config.searchEngine).then(response => {
      const searchResultsSection = document.querySelector('.search-results-section')
      toggleVisibility(searchResultsSection, hasDomain)

      if (!response.ok) {
        return handleSearchError(response.status + ': ' + response.statusText + ' - ' + response.type)
      }

      return response.json().then(r => {
        if (r.domain) {
          searchBox.value = r.domain
        }

        if (hasDomain) {
          const message = searchResultMessage(r, r.domain || domain)
          const searchResultsRow = document.querySelector('.search-results')
          searchResultsRow.innerHTML = `<span class='domain-search-output title'>${message}</span>`
        }

        const registrars = r.registrars || []
        addFilters(registrars)
        showRegistrars(registrars, r.domain)
        toggleReservedForm(r.summary === 'reserved', r.domain)
      })
    }).catch(handleSearchError)
  }

  function updateUriHistory (domain, filters) {
    if (window.history) {
      const url = new URL(window.location)
      url.searchParams.set('domain', domain)
      filters[0] ? url.searchParams.set('region', filters[0]) : url.searchParams.delete('region')
      filters[1] ? url.searchParams.set('language', filters[1]) : url.searchParams.delete('language')
      filters[2] ? url.searchParams.set('currency', filters[2]) : url.searchParams.delete('currency')
      filters[3] ? url.searchParams.set('envPolicy', filters[3]) : url.searchParams.delete('envPolicy')
      window.history.pushState({}, '', url)
    }
  }

  function submitSearch (e) {
    e.preventDefault()

    const domain = searchDomain()
    updateUriHistory(domain, getFilterValues())
    return search(domain)
  }

  document.querySelector('.btn-search').addEventListener('click', function (e) {
    submitSearch(e)
  })

  document.querySelector('.domain-search').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
      submitSearch(e)
    }
  })

  document.querySelector('.iframe-form-iframe').addEventListener('load', function (e) {
    toggleVisibility(document.querySelector('.submit-form'), false)
    toggleVisibility(document.querySelector('.submit-thanks'), true)
  })

  document.getElementById('makeoffer-form').addEventListener('submit', function (e) {
    config.onReservedSubmit(searchDomain())
  })

  function getUriParam (param) {
    if ('URLSearchParams' in window) {
      return new URLSearchParams(window.location.search).get(param)
    }
  }

  const domain = getUriParam('domain')
  search(domain)
}

window.fetchRegistrars = function (config) {
  return window.fetch(config.searchUrl + '/registrars').then(response => response.json())
}
