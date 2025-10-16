export interface IUserRewardsView {
    rewardViews: IRewardView[]
    availableStarPoints: number;
    availableStarPointsRedemptionAmountInPaise: number;
}

export interface IRewardView {
    rewardOffering: InstantRewardCategory;
    rewardCategory: InstantRewardCategory;
    rewardDesc: string;
    resourceUrl: string;
    starPoints: number;
}

export enum InstantRewardCategory {
    APP_RATING = "APP_RATING",
    VIDEO = "VIDEO",
}
