declare namespace IDict {
  interface ITbParams {
    page: number;
    size: number;
    id?: string;
    searchKey?: string;
    dataScopeType?: string;
    dataScopeDeptIds?: string;
    dataScopeUserId?: string;
  }
}
