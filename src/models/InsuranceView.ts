export interface IInsuranceView {
    isInsuranceDeclarationAccepted: boolean;
    insuranceId: string | undefined;
    insuranceTermsAcceptedDate: number | undefined;
    cardUri: string | undefined;
    insuranceIdGeneratedDate: number | undefined;
    onboardingLatitude: number | undefined;
    onboardingLongitude: number | undefined;
}
