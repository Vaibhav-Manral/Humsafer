import { ICompany } from '../models/Companies';

export class LocalCache {
  private static readonly userCompanyListStorageKey = "companyList";

  public static saveCompanyList(companyListView: ICompany[]) {
    window.localStorage.setItem(LocalCache.userCompanyListStorageKey, JSON.stringify(companyListView));
  }

  public static getCompanyList(): ICompany[] | undefined {
    const companyListJson = window.localStorage.getItem(LocalCache.userCompanyListStorageKey);
    if (companyListJson) {
      return JSON.parse(companyListJson);
    }
    return undefined;
  }

  public static clearCompanyList() {
    window.localStorage.removeItem(LocalCache.userCompanyListStorageKey);
  }
}
