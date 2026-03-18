// Sanity client stubbed — enable when Sanity is re-integrated.
// TODO: Restore createClient call once NEXT_PUBLIC_SANITY_PROJECT_ID is configured.
export const client = {
  fetch: () => Promise.resolve([]),
  patch: (_id: string) => ({
    set: () => ({ commit: () => Promise.resolve({}) }),
  }),
  delete: (_id: string) => Promise.resolve({}),
  create: (_doc: object) => Promise.resolve({ _id: "" }),
};
