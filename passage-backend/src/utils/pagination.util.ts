export interface PaginationOptions {
  page: number;
  limit: number;
}

export const getPaginationOptions = (page?: string | number, limit?: string | number): PaginationOptions => {
  const p = Math.max(1, parseInt(String(page)) || 1);
  const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));
  return { page: p, limit: l };
};

export const calculateOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

export const calculatePages = (total: number, limit: number): number => {
  return Math.ceil(total / limit);
};
