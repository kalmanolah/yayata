// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (username, password) => {
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

Cypress.Commands.add('setupServer', () => {
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
})