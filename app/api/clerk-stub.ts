// This is a stub file to fix Clerk import errors during build
// It won't be used at runtime as the real Clerk imports will be used instead

export const currentUser = async () => {
  return null;
};

export const auth = () => {
  return {
    userId: null,
    getToken: async () => null,
  };
};

export const clerkClient = {
  users: {
    getUser: async () => ({}),
    getUserList: async () => ([]),
  },
};

export default {
  currentUser,
  auth,
  clerkClient,
}; 