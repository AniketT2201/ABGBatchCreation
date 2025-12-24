

// const formatDate = (dateStr: string | null): string => {
//     if (!dateStr) return "-";
//         return new Intl.DateTimeFormat("en-GB", {
//             year: "numeric",
//             month: "short",
//             day: "2-digit",
//         }).format(new Date(dateStr));
//     };


 
export const checkDuplicateLocal = (modData: any[], newItem: any) => {
  return modData.some(
    (m) =>
      m.PosID === newItem.PosID &&
      m.TniDeptID === newItem.TniDeptID &&
      m.ModuleID === newItem.ModuleID &&
      m.LevelID === newItem.LevelID &&
      m.FinYearID === newItem.FinYearID
  );
};

export const chunkArray = (arr: any[], size: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};
