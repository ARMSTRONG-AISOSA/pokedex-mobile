import { useQuery } from '@tanstack/react-query';

import { getAbout } from '@/data/db/aboutRepo';

import { queryKeys } from './keys';

/** The About section's data for one species. */
export function useAbout(speciesId: number) {
  return useQuery({
    queryKey: queryKeys.about(speciesId),
    queryFn: () => getAbout(speciesId),
    enabled: Number.isInteger(speciesId) && speciesId > 0,
  });
}
