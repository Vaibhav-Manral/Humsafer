///<reference types="Cypress" />

describe('Login Test cases', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  afterEach(()=>{
    cy.logout();
  })

  it('Login with Valid mobile number', () => {
    cy.login('7777777777','123456');
  });

  it('Login with invalid mobile number', () => {
    cy.login('77777777','123456');
    cy.contains('Invalid phone number').should('exist');
  });

  it('Login with empty mobile number', () => {
    cy.login('','');
    cy.contains('Invalid phone number');
  });

  it('Login with invalid OTP',()=>{
    cy.login('7777777777','123459')
    cy.contains(' Please enter a valid OTP');
  })

  it('login with Null OTP',()=>{
    cy.login('7777777777','')
    cy.contains(' Please enter a valid OTP');
  })
});

