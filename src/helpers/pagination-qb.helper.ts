import { SelectQueryBuilder } from 'typeorm';

export async function paginateQuery(qb: SelectQueryBuilder<any>, page: number, limit: number) {
  const [items, totalItems] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    meta: {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    },
  };
}
