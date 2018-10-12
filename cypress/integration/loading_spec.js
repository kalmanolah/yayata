const baseUrl = Cypress.env('baseUrl')
const username = Cypress.env('username')
const password = Cypress.env('password')

describe('Loading Test', function() {
  beforeEach(() => {
    cy.setupServer()
    cy.login(username, password)
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