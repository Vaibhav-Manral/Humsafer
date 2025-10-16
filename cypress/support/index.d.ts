
  // cypress/support/index.d.ts
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(MobileNumber: string, OTP: string): Chainable<any>; 
    logout(): Chainable<any>; 
  }
}
