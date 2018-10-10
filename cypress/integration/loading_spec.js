const baseUrl = Cypress.env('baseUrl')
const username = Cypress.env('username')
const password = Cypress.env('password')

describe('Loading Test', function() {
  beforeEach(() => {
    cy.server({
      matchBase: false
    })
    cy.route('GET', '**/config.json').as('config')
    cy.route('POST', '**/oauth/v2/token/').as('oauth_token')
    cy.route('GET', '**/me/*').as('me')
    cy.route('GET', '**/users/*').as('users')
    cy.route('GET', '**/locations/*').as('locations')
    cy.route('GET', '**/leave/*').as('leave')
    cy.route('GET', '**/timesheets/*').as('timesheets')
    cy.route('GET', '**/holidays/*').as('holidays')
    cy.route('GET', '**/performance_types/*').as('performance_types')
    cy.route('GET', '**/contract_users/*').as('contract_users')
    cy.route('GET', '**/contracts/*').as('contracts')
    cy.route('GET', '**/leave_types/*').as('leave_types')
    cy.route('GET', '**/range_availability/*').as('range_availability')
    cy.route('GET', '**/range_info/*').as('range_info')
  
    cy.visit('/')
    cy.url().should('include', '/auth/login')
  
    cy.get('#username-input').type(username).should('have.value', username)
    cy.get('#password-input').type(password).should('have.value', password)
    cy.get('form').submit()

    cy.wait('@oauth_token').its('status').should('eq', 200)
    cy.wait('@me').its('status').should('eq', 200)

    cy.url().should('include', '/dashboard')

    cy.wait('@timesheets')
    cy.wait('@users')
    cy.wait('@leave_types')
    cy.wait('@contract_users')
    cy.wait('@performance_types')
    cy.wait('@contracts')
    cy.wait('@holidays')
    cy.wait('@range_availability')
    cy.wait('@range_info')
  })

  afterEach(() => {
    cy.visit('/auth/logout')
    cy.url().should('include', '/auth/login')
    cy.server({
      enable: false
    })
  })

  it('Visits homepage', function() {
    cy.visit('/')
    cy.url().should('include', '/dashboard')
  })

  it('Visits dashboard', function() {
    // cy.visit('/dashboard')
    cy.url().should('include', '/dashboard')
  })

  it('Visits timesheets', function() {
    cy.visit('/timesheets')
    cy.wait('@timesheets').its('status').should('eq', 200)
  })

  it('Visits month', function() {
    cy.visit('/calendar/month')
    cy.wait('@range_info').its('status').should('eq', 200)
  })

  it('Visits week', function() {
    cy.visit('/calendar/week')
    cy.wait('@range_info').its('status').should('eq', 200)
  })

  it('Visits leave', function() {
    cy.visit('/leave')
    cy.wait('@leave').its('status').should('eq', 200)
  })

  it('Visits colleagues', function() {
    cy.visit('/colleagues')
    cy.wait('@users').its('status').should('eq', 200)
  })

  it('Visits availability', function() {
    cy.visit('/availability')
    cy.wait('@locations').its('status').should('eq', 200)
    cy.wait('@users').its('status').should('eq', 200)
    cy.wait('@range_availability').its('status').should('eq', 200)
  })

  it('Visits FAQ', function() {
    cy.visit('/faq')
  })

  it('Visits changelog', function() {
    cy.visit('/changelog')
  })
})